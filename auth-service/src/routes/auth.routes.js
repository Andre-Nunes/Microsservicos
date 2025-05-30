// auth-service/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Rota para registar um novo utilizador
// POST /api/auth/register
router.post('/register', authController.register);

// Rota para login de um utilizador
// POST /api/auth/login
router.post('/login', authController.login);

// Poderia adicionar aqui uma rota para validar token, se necessário
// Ex: router.get('/validate-token', authMiddleware.verifyToken, authController.validateToken);

module.exports = router;