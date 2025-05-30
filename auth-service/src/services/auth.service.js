// auth-service/src/services/auth.service.js
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Importar o modelo User
// bcryptjs já foi importado e usado nos hooks e isValidPassword do modelo User

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

if (!JWT_SECRET) {
  throw new Error('O segredo JWT (JWT_SECRET) não está definido nas variáveis de ambiente!');
}

/**
 * Regista um novo utilizador.
 * @param {object} userData - Dados do utilizador (ex: { email, password }).
 * @returns {Promise<User>} O utilizador criado (sem a password).
 * @throws {Error} Se o email já existir ou ocorrer um erro.
 */
async function registerUser(userData) {
  const { email, password } = userData;

  if (!email || !password) {
    throw new Error('Email e password são obrigatórios.');
  }

  try {
    // Verificar se o utilizador já existe (o modelo User tem 'unique: true' para email)
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Email já registado.');
    }

    // O hook beforeCreate no modelo User irá fazer o hash da password automaticamente
    const newUser = await User.create({ email, password });

    // Não retornar a password, mesmo que hasheada
    const userResponse = newUser.toJSON();
    delete userResponse.password; 
    return userResponse;

  } catch (error) {
    // Tratar erros de validação do Sequelize (ex: email já existe)
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new Error('Email já registado.');
    }
    console.error('Erro ao registar utilizador no serviço:', error);
    throw new Error('Não foi possível registar o utilizador.');
  }
}

/**
 * Autentica um utilizador e retorna um JWT.
 * @param {string} email - O email do utilizador.
 * @param {string} password - A password do utilizador.
 * @returns {Promise<object>} Objeto com o token, userId e tempo de expiração.
 * @throws {Error} Se as credenciais forem inválidas ou ocorrer um erro.
 */
async function loginUser(email, password) {
  if (!email || !password) {
    throw new Error('Email e password são obrigatórios.');
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Credenciais inválidas. Utilizador não encontrado.');
    }

    // Usar o método isValidPassword definido no modelo User
    const isPasswordValid = await user.isValidPassword(password);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas. Password incorreta.');
    }

    // Se a password for válida, gerar o JWT
    const payload = {
      sub: user.id, // 'sub' (subject) é o ID do utilizador, uma claim padrão
      email: user.email,
      // Pode adicionar outros claims, como roles, se tiver
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return {
      token,
      userId: user.id,
      email: user.email,
      expiresIn: JWT_EXPIRES_IN,
    };

  } catch (error) {
    // Não expor detalhes do erro de BD no login por segurança
    console.error('Erro ao fazer login do utilizador no serviço:', error.message);
    // Se já foi uma das nossas mensagens de erro personalizadas, relançar
    if (error.message.startsWith('Credenciais inválidas')) {
        throw error;
    }
    throw new Error('Erro no processo de login.');
  }
}

module.exports = {
  registerUser,
  loginUser,
};