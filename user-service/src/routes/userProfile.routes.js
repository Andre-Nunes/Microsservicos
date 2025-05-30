// user-service/src/routes/userProfile.routes.js
const express = require('express');
const router = express.Router();
const userProfileController = require('../controllers/userProfile.controller');

// Middleware de autenticação e autorização será adicionado aqui ou no API Gateway
// Ex: const authMiddleware = require('../middleware/auth');

// POST /api/users/:userId/profile - Criar um perfil para um utilizador (ex: chamado pelo API Gateway após registo)
router.post('/:userId/profile', /* authMiddleware.verifyToken, authMiddleware.isSelfOrAdmin, */ userProfileController.createUserProfile);

// GET /api/users/:userId/profile - Obter o perfil de um utilizador
router.get('/:userId/profile', /* authMiddleware.verifyToken, */ userProfileController.getUserProfile);

// PUT /api/users/:userId/profile - Atualizar o perfil de um utilizador
router.put('/:userId/profile', /* authMiddleware.verifyToken, authMiddleware.isSelf, */ userProfileController.updateUserProfile);

// DELETE /api/users/:userId/profile - Eliminar o perfil de um utilizador
// (Lembre-se do ON DELETE CASCADE. Este endpoint pode ser mais para gestão administrativa ou se a cascata falhar)
router.delete('/:userId/profile', /* authMiddleware.verifyToken, authMiddleware.isSelfOrAdmin, */ userProfileController.deleteUserProfile);

module.exports = router;