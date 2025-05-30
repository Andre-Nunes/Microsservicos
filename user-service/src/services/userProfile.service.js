// user-service/src/services/userProfile.service.js
const { UserProfile } = require('../models'); // Importar o modelo UserProfile

/**
 * Cria um novo perfil para um utilizador.
 * @param {number} userId - O ID do utilizador para quem o perfil está a ser criado.
 * @param {object} profileData - Dados do perfil (ex: { name, bio, avatarUrl }).
 * @returns {Promise<UserProfile>} O perfil criado.
 * @throws {Error} Se o userId não for fornecido, o perfil já existir para esse userId, ou ocorrer um erro.
 */
async function createUserProfile(userId, profileData) {
  if (!userId) {
    throw new Error('userId é obrigatório para criar um perfil.');
  }

  try {
    // Verificar se já existe um perfil para este userId, pois é uma relação 1-para-1
    const existingProfile = await UserProfile.findOne({ where: { userId } });
    if (existingProfile) {
      throw new Error(`Perfil já existe para o utilizador com ID ${userId}.`);
    }

    const newProfile = await UserProfile.create({
      userId, // userId é a chave estrangeira
      name: profileData.name,
      bio: profileData.bio,
      avatarUrl: profileData.avatarUrl,
      // Adicionar outros campos conforme necessário
    });
    return newProfile;
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError' || error.message.includes('Perfil já existe')) {
        throw new Error(`Perfil já existe para o utilizador com ID ${userId}.`);
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new Error(`Utilizador com ID ${userId} não encontrado na tabela Users.`);
    }
    console.error('Erro ao criar perfil de utilizador no serviço:', error);
    throw new Error('Não foi possível criar o perfil do utilizador.');
  }
}

/**
 * Obtém o perfil de um utilizador pelo seu userId.
 * @param {number} userId - O ID do utilizador cujo perfil deve ser obtido.
 * @returns {Promise<UserProfile|null>} O perfil encontrado, ou null se não existir.
 */
async function getUserProfileByUserId(userId) {
  if (!userId) {
    throw new Error('userId é obrigatório para obter um perfil.');
  }
  try {
    const profile = await UserProfile.findOne({
      where: { userId: userId },
      // Se quisesse incluir dados do User (se houvesse associação definida e modelo User aqui):
      // include: [{ model: User, as: 'user' }] 
    });
    return profile;
  } catch (error) {
    console.error(`Erro ao obter perfil para o utilizador ${userId} no serviço:`, error);
    throw new Error('Não foi possível obter o perfil do utilizador.');
  }
}

/**
 * Atualiza o perfil de um utilizador existente.
 * Apenas o próprio utilizador (ou um administrador) deve poder atualizar o perfil.
 * A verificação de permissão (se o userId do token corresponde ao userId do perfil)
 * será feita no controlador ou no API Gateway.
 * @param {number} userId - O ID do utilizador cujo perfil será atualizado.
 * @param {object} updateData - Os dados a serem atualizados no perfil (ex: { name, bio, avatarUrl }).
 * @returns {Promise<UserProfile|null>} O perfil atualizado, ou null se não for encontrado.
 * @throws {Error} Se ocorrer um erro durante a atualização.
 */
async function updateUserProfile(userId, updateData) {
  if (!userId) {
    throw new Error('userId é obrigatório para atualizar um perfil.');
  }

  try {
    const userProfile = await UserProfile.findOne({ where: { userId: userId } });

    if (!userProfile) {
      // Perfil não encontrado para este utilizador
      return null;
    }

    // Remover campos que não devem ser atualizados diretamente por este método, se houver
    const cleanUpdateData = { ...updateData };
    delete cleanUpdateData.id; // O ID do perfil não deve ser alterado
    delete cleanUpdateData.userId; // O userId associado ao perfil não deve ser alterado por aqui
    delete cleanUpdateData.createdAt;
    // O updatedAt será atualizado automaticamente

    const updatedProfile = await userProfile.update(cleanUpdateData);
    return updatedProfile;

  } catch (error) {
    console.error(`Erro ao atualizar perfil para o utilizador ${userId} no serviço:`, error);
    throw new Error('Não foi possível atualizar o perfil do utilizador.');
  }
}

/**
 * Elimina o perfil de um utilizador.
 * Geralmente, isto seria acionado pela eliminação da conta do utilizador no AuthService/UserService principal.
 * A restrição de chave estrangeira com ON DELETE CASCADE já deve tratar disto se o User for eliminado.
 * Esta função pode ser usada para uma eliminação explícita do perfil, se necessário.
 * @param {number} userId - O ID do utilizador cujo perfil será eliminado.
 * @returns {Promise<boolean>} True se o perfil foi eliminado, false caso contrário.
 * @throws {Error} Se ocorrer um erro durante a eliminação.
 */
async function deleteUserProfile(userId) {
  if (!userId) {
    throw new Error('userId é obrigatório para eliminar um perfil.');
  }
  try {
    const deletedRowsCount = await UserProfile.destroy({
      where: { userId: userId },
    });

    return deletedRowsCount > 0; // Retorna true se uma ou mais linhas foram eliminadas
  } catch (error) {
    console.error(`Erro ao eliminar perfil para o utilizador ${userId} no serviço:`, error);
    throw new Error('Não foi possível eliminar o perfil do utilizador.');
  }
}

// Atualize o module.exports para incluir todas as funções
module.exports = {
  createUserProfile,
  getUserProfileByUserId,
  updateUserProfile,
  deleteUserProfile,
};