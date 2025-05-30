// user-service/src/controllers/userProfile.controller.js
const userProfileService = require('../services/userProfile.service');

async function createUserProfile(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const profileData = req.body; // Ex: { name, bio, avatarUrl }

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'userId inválido na URL.' });
    }

    const newProfile = await userProfileService.createUserProfile(userId, profileData);
    res.status(201).json(newProfile);
  } catch (error) {
    if (error.message.includes('Perfil já existe') || error.message.includes('Utilizador com ID') ) {
      return res.status(409).json({ message: error.message }); // 409 Conflict or 404 for user not found
    }
    if (error.message.includes('userId é obrigatório')) {
         return res.status(400).json({ message: error.message });
    }
    console.error('[UserProfileController] Erro ao criar perfil:', error.message);
    res.status(500).json({ message: error.message || 'Erro ao criar perfil do utilizador.' });
  }
}

async function getUserProfile(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'userId inválido na URL.' });
    }

    const profile = await userProfileService.getUserProfileByUserId(userId);
    if (profile) {
      res.status(200).json(profile);
    } else {
      res.status(404).json({ message: 'Perfil não encontrado para este utilizador.' });
    }
  } catch (error) {
    console.error('[UserProfileController] Erro ao obter perfil:', error.message);
    res.status(500).json({ message: error.message || 'Erro ao obter perfil do utilizador.' });
  }
}

async function updateUserProfile(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const updateData = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'userId inválido na URL.' });
    }

    // Nota: A verificação de permissão (se o utilizador autenticado pode atualizar este perfil)
    // seria feita aqui ou no API Gateway, comparando req.user.id com req.params.userId.
    // Por agora, o serviço updateUserProfile não faz essa verificação explícita de quem está a chamar.

    const updatedProfile = await userProfileService.updateUserProfile(userId, updateData);
    if (updatedProfile) {
      res.status(200).json(updatedProfile);
    } else {
      res.status(404).json({ message: 'Perfil não encontrado para atualizar.' });
    }
  } catch (error) {
    console.error('[UserProfileController] Erro ao atualizar perfil:', error.message);
    res.status(500).json({ message: error.message || 'Erro ao atualizar perfil do utilizador.' });
  }
}

async function deleteUserProfile(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'userId inválido na URL.' });
    }

    // Nota: A verificação de permissão também se aplicaria aqui.

    const success = await userProfileService.deleteUserProfile(userId);
    if (success) {
      res.status(204).send(); // 204 No Content
    } else {
      res.status(404).json({ message: 'Perfil não encontrado para eliminar.' });
    }
  } catch (error) {
    console.error('[UserProfileController] Erro ao eliminar perfil:', error.message);
    res.status(500).json({ message: error.message || 'Erro ao eliminar perfil do utilizador.' });
  }
}

module.exports = {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};