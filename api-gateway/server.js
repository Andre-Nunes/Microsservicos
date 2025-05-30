// api-gateway/server.js
const express = require('express');
const http = require('http'); // Para proxy manual
const config = require('./src/config');
const { verifyToken } = require('./src/middleware/auth.middleware');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[API Gateway] Pedido recebido: ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0 && req.originalUrl !== '/api/auth/login' && !req.originalUrl.includes('/register')) {
    console.log(`[API Gateway] Corpo do Pedido: ${JSON.stringify(req.body).substring(0, 500)}...`); // Log truncado
  }
  next();
});

app.get('/', (req, res) => res.send('API Gateway está a funcionar!'));

// Função helper para fazer um pedido HTTP (usada pela orquestração e proxies manuais)
function makeHttpRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let rawData = '';
      res.setEncoding('utf8'); // Garantir que a resposta é tratada como string
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          // Tentar parsear como JSON, mas retornar rawData se falhar
          const parsedData = rawData ? JSON.parse(rawData) : {}; // Retorna objeto vazio se rawData for vazio
          resolve({ statusCode: res.statusCode, headers: res.headers, body: parsedData });
        } catch (e) {
          console.warn(`[API Gateway] makeHttpRequest - Resposta não é JSON (ou JSON inválido) para ${options.path}:`, rawData.substring(0, 200));
          resolve({ statusCode: res.statusCode, headers: res.headers, body: rawData }); // Retorna rawData se não for JSON válido
        }
      });
    });
    req.on('error', (e) => {
      console.error(`[API Gateway] makeHttpRequest - Erro no pedido para ${options.hostname}:${options.port}${options.path}:`, e.message);
      reject(e);
    });
    req.on('timeout', () => {
        req.destroy(); // Garante que o socket é destruído
        console.error(`[API Gateway] makeHttpRequest - Timeout para ${options.hostname}:${options.port}${options.path}`);
        reject(new Error('Request Timeout'));
    });
    req.setTimeout(30000); // 30 segundos

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Função helper para criar um manipulador de proxy manual (DEFINIDA ANTES DE SER USADA)
function createManualProxyHandler(serviceName, serviceUrl) {
  console.log(`[API Gateway] Configurando proxy MANUAL para ${serviceName} com target: ${serviceUrl}`);
  return async (clientReq, clientRes) => { // Tornar este manipulador async
    const targetServiceParsedUrl = new URL(serviceUrl);
    const targetPath = clientReq.originalUrl;

    console.log(`[API Gateway] Proxying MANUALMENTE para ${serviceName}: ${clientReq.method} ${clientReq.originalUrl} -> ${targetServiceParsedUrl.hostname}:${targetServiceParsedUrl.port}${targetPath}`);

    const options = {
      hostname: targetServiceParsedUrl.hostname,
      port: targetServiceParsedUrl.port,
      path: targetPath,
      method: clientReq.method,
      headers: { ...clientReq.headers }, // Copia os cabeçalhos do pedido original
    };
    // O cabeçalho 'host' deve ser o do serviço de destino para evitar problemas com virtual hosts
    options.headers['host'] = targetServiceParsedUrl.host; 

    // Se o middleware verifyToken adicionou req.user, passá-lo para os serviços de backend
    if (clientReq.user && clientReq.user.sub) {
        console.log(`[API Gateway] Adicionando cabeçalho X-User-ID: ${clientReq.user.sub} para ${serviceName}`);
        options.headers['X-User-ID'] = clientReq.user.sub;
    }
    
    // Remover cabeçalhos que podem causar problemas com o proxy manual
    delete options.headers['content-length']; // Deixar o http.request calcular
    delete options.headers['transfer-encoding'];


    try {
        const bodyData = (clientReq.body && Object.keys(clientReq.body).length > 0) ? JSON.stringify(clientReq.body) : null;
        if (bodyData) {
            options.headers['Content-Type'] = 'application/json'; // Garantir que é JSON
            // O Content-Length será definido pelo http.request ao usar req.write(bodyData)
        }

        const serviceResponse = await makeHttpRequest(options, bodyData);
        
        // Encaminhar os cabeçalhos da resposta do serviço de destino para o cliente original
        // Filtrar cabeçalhos problemáticos como 'transfer-encoding' se o corpo for reprocessado
        const responseHeaders = { ...serviceResponse.headers };
        delete responseHeaders['transfer-encoding']; // Pode causar problemas se o corpo for JSON e não chunked
        delete responseHeaders['content-length']; // Deixar o Express recalcular se o corpo for modificado

        clientRes.status(serviceResponse.statusCode).set(responseHeaders);

        if (typeof serviceResponse.body === 'object') {
            clientRes.json(serviceResponse.body);
        } else {
            clientRes.send(serviceResponse.body);
        }

    } catch (error) {
        console.error(`[API Gateway] Erro no manipulador de proxy para ${serviceName}:`, error.message);
        if (!clientRes.headersSent) {
            if (error.message === 'Request Timeout') {
                clientRes.status(504).send(`Gateway Timeout: O ${serviceName} demorou muito a responder.`);
            } else {
                clientRes.status(502).send(`Bad Gateway: Erro ao comunicar com o ${serviceName}.`);
            }
        }
    }
  };
}


// --- Configuração dos Proxies ---

// Proxy e Orquestração para AuthService
if (config.authServiceUrl) {
  console.log(`[API Gateway] Configurando proxy/orquestração para /api/auth/* com target: ${config.authServiceUrl}`);
  
  app.use('/api/auth', async (clientReq, clientRes) => { // Manipulador específico para /api/auth
    const isRegisterRoute = clientReq.originalUrl === '/api/auth/register' && clientReq.method === 'POST';
    const authServiceTarget = new URL(config.authServiceUrl);
    const authServicePath = clientReq.originalUrl;

    const authOptions = {
      hostname: authServiceTarget.hostname,
      port: authServiceTarget.port,
      path: authServicePath,
      method: clientReq.method,
      headers: { ...clientReq.headers, 'host': authServiceTarget.host },
    };
    delete authOptions.headers.host;
    delete authOptions.headers['content-length'];


    let authServiceResponse;
    try {
      console.log(`[API Gateway] Encaminhando para AuthService: ${authOptions.method} ${authServicePath}`);
      const bodyData = (clientReq.body && Object.keys(clientReq.body).length > 0) ? JSON.stringify(clientReq.body) : null;
      if (bodyData) {
        authOptions.headers['Content-Type'] = 'application/json';
      }
      
      authServiceResponse = await makeHttpRequest(authOptions, bodyData);
      console.log(`[API Gateway] Resposta do AuthService: Status ${authServiceResponse.statusCode}`);

      if (isRegisterRoute && authServiceResponse.statusCode === 201 && authServiceResponse.body && authServiceResponse.body.userId) {
        const newUserId = authServiceResponse.body.userId;
        const userEmail = authServiceResponse.body.email; // Assumindo que AuthService retorna email
        console.log(`[API Gateway] Registo bem-sucedido no AuthService para userId: ${newUserId}. A tentar criar perfil no UserService.`);

        if (config.userServiceUrl) {
          const userServiceTarget = new URL(config.userServiceUrl);
          const userServicePath = `/api/users/${newUserId}/profile`; 
          const profileCreationOptions = {
            hostname: userServiceTarget.hostname,
            port: userServiceTarget.port,
            path: userServicePath,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'host': userServiceTarget.host },
          };
          delete profileCreationOptions.headers.host;

          const profileBody = JSON.stringify({ name: userEmail || `Utilizador ${newUserId}` }); 
          
          try {
            const profileServiceResponse = await makeHttpRequest(profileCreationOptions, profileBody);
            console.log(`[API Gateway] Resposta da criação de perfil no UserService: Status ${profileServiceResponse.statusCode}`);
            if (profileServiceResponse.statusCode >= 200 && profileServiceResponse.statusCode < 300) {
              console.log(`[API Gateway] Perfil criado com sucesso para userId: ${newUserId}`);
              clientRes.status(authServiceResponse.statusCode).json(authServiceResponse.body);
            } else {
              console.error(`[API Gateway] Falha ao criar perfil para userId: ${newUserId}, Status: ${profileServiceResponse.statusCode}`, profileServiceResponse.body);
              clientRes.status(authServiceResponse.statusCode).json({
                ...authServiceResponse.body,
                profileCreationWarning: 'Utilizador registado, mas ocorreu um problema ao criar o perfil inicial.'
              });
            }
          } catch (profileError) {
            console.error(`[API Gateway] Erro ao chamar o UserService para criar perfil para userId: ${newUserId}`, profileError);
            clientRes.status(authServiceResponse.statusCode).json({
              ...authServiceResponse.body,
              profileCreationError: 'Utilizador registado, mas falha ao contactar o serviço de perfis.'
            });
          }
        } else {
          console.warn('[API Gateway] URL do UserService não configurada. Não foi possível criar perfil após registo.');
          clientRes.status(authServiceResponse.statusCode).json(authServiceResponse.body);
        }
      } else {
        // Para outras rotas de /api/auth ou se o registo falhou, apenas encaminhar a resposta do AuthService
        const responseHeaders = { ...authServiceResponse.headers };
        delete responseHeaders['transfer-encoding'];
        delete responseHeaders['content-length'];
        clientRes.status(authServiceResponse.statusCode).set(responseHeaders);
        if (typeof authServiceResponse.body === 'object') {
            clientRes.json(authServiceResponse.body);
        } else {
            clientRes.send(authServiceResponse.body);
        }
      }
    } catch (error) {
      console.error('[API Gateway] Erro geral no proxy/orquestração para AuthService:', error);
      if (!clientRes.headersSent) {
        if (error.message === 'Request Timeout') {
            clientRes.status(504).send('Gateway Timeout: AuthService demorou muito a responder.');
        } else {
            clientRes.status(502).send('Bad Gateway: Erro ao processar pedido de autenticação.');
        }
      }
    }
  });
} else {
  console.warn('URL do AuthService não configurada.');
}


// --- Proxy para UserService (PROTEGIDO) ---
if (config.userServiceUrl) {
  app.use('/api/users', verifyToken, createManualProxyHandler('UserService', config.userServiceUrl));
} else { 
  console.warn('URL do UserService não configurada. O proxy para /api/users não será ativado.');
}

// --- Proxy para TaskService (PROTEGIDO) ---
if (config.taskServiceUrl) {
  app.use('/api/tasks', verifyToken, createManualProxyHandler('TaskService', config.taskServiceUrl));
} else { 
  console.warn('URL do TaskService não configurada. O proxy para /api/tasks não será ativado.');
}


if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`API Gateway a escutar na porta ${config.port}`);
    if (config.authServiceUrl) console.log(`  -> Auth      Service: /api/auth/* -> ${config.authServiceUrl}`);
    if (config.userServiceUrl) console.log(`  -> User      Service: /api/users/* (protegido) -> ${config.userServiceUrl}`);
    if (config.taskServiceUrl) console.log(`  -> Task      Service: /api/tasks/* (protegido) -> ${config.taskServiceUrl}`);
    if (!config.jwtSecret) console.warn("  AVISO: JWT_SECRET não está definido no .env do API Gateway!");
  });
}

module.exports = app;
