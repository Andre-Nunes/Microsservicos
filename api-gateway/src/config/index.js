// api-gateway/src/config/index.js
const path = require('path'); // Importar o módulo 'path' do Node.js

// Configurar dotenv para carregar o ficheiro .env da raiz do projeto api-gateway
// __dirname aqui é o caminho para a pasta 'src/config'
// path.resolve(__dirname, '../../.env') irá construir o caminho correto para 'api-gateway/.env'
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: process.env.API_GATEWAY_PORT || 3000,
  authServiceUrl: process.env.AUTH_SERVICE_URL,
  userServiceUrl: process.env.USER_SERVICE_URL,
  taskServiceUrl: process.env.TASK_SERVICE_URL,
  jwtSecret: process.env.JWT_SECRET,
};

// Validar se as variáveis essenciais estão definidas
if (!config.authServiceUrl || !config.userServiceUrl || !config.taskServiceUrl || !config.jwtSecret) {
  console.error("ERRO: Variáveis de ambiente cruciais para o API Gateway não estão definidas!");
  console.error("Verifique AUTH_SERVICE_URL, USER_SERVICE_URL, TASK_SERVICE_URL, e JWT_SECRET no ficheiro .env na raiz da pasta 'api-gateway'.");
  process.exit(1); 
}

module.exports = config;