// api-gateway/src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const config = require('../config'); // Para aceder ao JWT_SECRET

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization']; // Formato esperado: Bearer TOKEN
  const token = authHeader && authHeader.split(' ')[1]; // Extrai o TOKEN

  if (!token) {
    return res.status(403).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }

  try {
    // Verifica o token usando o mesmo segredo que o AuthService usou para o assinar
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Adiciona o payload descodificado (que contém userId, email, etc.) ao objeto req
    // para que os próximos middlewares ou manipuladores de rota (incluindo o proxy) possam usá-lo.
    // Os serviços de backend não verão isto diretamente, mas o API Gateway pode usá-lo
    // para tomar decisões ou passar informações (ex: cabeçalhos customizados).
    req.user = decoded; 
    
    console.log('[API Gateway - AuthMiddleware] Token válido para o utilizador:', decoded.sub); // decoded.sub é o userId
    next(); // Token válido, prossegue para o próximo middleware ou rota de proxy
  } catch (error) {
    console.error('[API Gateway - AuthMiddleware] Erro na validação do token:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado.' });
    }
    return res.status(401).json({ message: 'Token inválido.' });
  }
}

module.exports = {
  verifyToken,
};