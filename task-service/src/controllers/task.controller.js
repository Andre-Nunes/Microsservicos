// task-service/src/controllers/task.controller.js
const taskService = require('../services/task.service');

// Criar uma nova tarefa
async function createTask(req, res) {
  try {
    // Assumindo que o userId virá do token JWT (a ser implementado no futuro)
    // Por agora, podemos simular ou esperar que venha no corpo do pedido
    const taskData = { ...req.body }; 
    // if (req.user && req.user.id) { // Exemplo se o middleware de auth adicionar req.user
    //   taskData.userId = req.user.id;
    // } else if (!taskData.userId) {
    //   return res.status(400).json({ message: 'userId é obrigatório.' });
    // }


    // Validação básica de entrada (pode ser melhorada com bibliotecas como Joi ou express-validator)
    if (!taskData.title || !taskData.userId) {
         return res.status(400).json({ message: "Título e ID do utilizador são obrigatórios." });
    }

    const task = await taskService.createTask(taskData);
    res.status(201).json(task);
  } catch (error) {
    // O erro lançado pelo serviço já é 'Não foi possível criar a tarefa...'
    // ou 'Título e ID do utilizador são obrigatórios...'
    if (error.message.includes("obrigatórios")) {
        res.status(400).json({ message: error.message });
    } else {
        res.status(500).json({ message: error.message || 'Erro ao criar tarefa.' });
    }
  }
}

// Obter todas as tarefas de um utilizador
async function getAllTasks(req, res) {
  try {
    // Assumindo que o userId virá de um parâmetro de query ou do token JWT
    // Por agora, vamos assumir que vem de um parâmetro de query para simplificar
    // Ou, idealmente, do req.user.id após autenticação
    const userId = req.query.userId; // Ex: /tasks?userId=123
                                  // Ou, no futuro: const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: 'userId é obrigatório como parâmetro de query.' });
    }
    // TODO: Adicionar extração de outros filtros de req.query se necessário
    const tasks = await taskService.getAllTasksByUserId(parseInt(userId, 10));
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Erro ao obter tarefas.' });
  }
}

// Obter uma tarefa por ID
async function getTaskById(req, res) {
  try {
    const taskId = req.params.id;
    // const userId = req.user.id; // Para garantir que o utilizador só acede às suas tarefas
    // Por agora, para simplificar o teste sem auth, não passaremos userId
    const task = await taskService.getTaskById(parseInt(taskId, 10)); 
    if (task) {
      res.status(200).json(task);
    } else {
      res.status(404).json({ message: 'Tarefa não encontrada.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Erro ao obter tarefa.' });
  }
}

// Atualizar uma tarefa
async function updateTask(req, res) {
  try {
    const taskId = req.params.id;
    const updateData = req.body;
    // const userId = req.user.id; // O utilizador autenticado
    
    // Para testar sem auth, vamos simular o userId ou esperar no body (não ideal para produção)
    const userId = req.body.userId_for_update_permission; // Temporário para teste, REMOVER/ALTERAR
    if (!userId) {
        return res.status(400).json({ message: "userId_for_update_permission é obrigatório no corpo para este teste."});
    }


    const task = await taskService.updateTask(parseInt(taskId, 10), parseInt(userId, 10), updateData);
    if (task) {
      res.status(200).json(task);
    } else {
      // Pode ser 404 (não encontrada) ou 403 (não tem permissão, embora o serviço já trate disso retornando null)
      res.status(404).json({ message: 'Tarefa não encontrada ou não tem permissão para atualizar.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Erro ao atualizar tarefa.' });
  }
}

// Eliminar uma tarefa
async function deleteTask(req, res) {
  try {
    const taskId = req.params.id;
    // const userId = req.user.id; // O utilizador autenticado

    // Para testar sem auth, vamos simular o userId ou esperar no body (não ideal para produção)
    const userId = req.body.userId_for_delete_permission; // Temporário para teste, REMOVER/ALTERAR
    if (!userId) {
        return res.status(400).json({ message: "userId_for_delete_permission é obrigatório no corpo para este teste."});
    }

    const success = await taskService.deleteTask(parseInt(taskId, 10), parseInt(userId, 10));
    if (success) {
      res.status(204).send(); // 204 No Content
    } else {
      // Pode ser 404 (não encontrada) ou 403 (não tem permissão)
      res.status(404).json({ message: 'Tarefa não encontrada ou não tem permissão para eliminar.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Erro ao eliminar tarefa.' });
  }
}

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};