// auth-service/src/controllers/auth.controller.js
const authService = require('../services/auth.service');

async function register(req, res) {
  try {
    const { email, password } = req.body;
    // Validação básica de entrada (pode ser melhorada com Joi, express-validator, etc.)
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e password são obrigatórios.' });
    }

    const user = await authService.registerUser({ email, password });
    // Não enviar a password na resposta, mesmo que hasheada.
    // O serviço já deve retornar o utilizador sem a password.
    res.status(201).json({
      message: 'Utilizador registado com sucesso!',
      userId: user.id, // Assumindo que o serviço retorna o utilizador com id
      email: user.email,
    });
  } catch (error) {
    // O serviço já lança erros específicos (ex: 'Email já registado.')
    if (error.message === 'Email já registado.') {
      return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    if (error.message === 'Email e password são obrigatórios.') {
         return res.status(400).json({ message: error.message });
    }
    console.error('[AuthController] Erro no registo:', error.message);
    res.status(500).json({ message: error.message || 'Erro ao registar utilizador.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e password são obrigatórios.' });
    }

    const loginResult = await authService.loginUser(email, password);
    // loginResult contém { token, userId, email, expiresIn }
    res.status(200).json(loginResult);

  } catch (error) {
    // O serviço já lança erros específicos (ex: 'Credenciais inválidas...')
    if (error.message.startsWith('Credenciais inválidas')) {
      return res.status(401).json({ message: error.message }); // 401 Unauthorized
    }
    if (error.message === 'Email e password são obrigatórios.') {
     return res.status(400).json({ message: error.message });
    }
    console.error('[AuthController] Erro no login:', error.message);
    res.status(500).json({ message: error.message || 'Erro no processo de login.' });
  }
}

module.exports = {
  register,
  login,
};