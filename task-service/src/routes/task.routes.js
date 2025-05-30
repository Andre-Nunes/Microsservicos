// task-service/src/routes/task.routes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');

// Middleware de autenticação (a ser adicionado no futuro)
// const authMiddleware = require('../middleware/auth.middleware'); // Exemplo

// Definir as rotas para tarefas
// POST /api/tasks - Criar uma nova tarefa
router.post('/', /* authMiddleware.verifyToken, */ taskController.createTask);

// GET /api/tasks - Obter todas as tarefas (para um utilizador, via query param por agora)
router.get('/', /* authMiddleware.verifyToken, */ taskController.getAllTasks);

// GET /api/tasks/:id - Obter uma tarefa específica
router.get('/:id', /* authMiddleware.verifyToken, */ taskController.getTaskById);

// PUT /api/tasks/:id - Atualizar uma tarefa existente
router.put('/:id', /* authMiddleware.verifyToken, */ taskController.updateTask);

// DELETE /api/tasks/:id - Eliminar uma tarefa
router.delete('/:id', /* authMiddleware.verifyToken, */ taskController.deleteTask);

module.exports = router;