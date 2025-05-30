// task-service/src/services/task.service.js
const { Task } = require('../models'); // O Sequelize exporta os modelos dentro do objeto db que exportamos de models/index.js

/**
 * Cria uma nova tarefa na base de dados.
 * @param {object} taskData - Os dados da tarefa a ser criada (ex: { title, description, userId, ... }).
 * @returns {Promise<Task>} A tarefa criada.
 * @throws {Error} Se os dados obrigatórios não forem fornecidos ou ocorrer um erro.
 */
async function createTask(taskData) {
  // Validação básica (pode ser expandida)
  if (!taskData.title || !taskData.userId) {
    throw new Error('Título e ID do utilizador são obrigatórios para criar uma tarefa.');
  }

  try {
    const newTask = await Task.create(taskData);
    return newTask;
  } catch (error) {
    console.error('Erro ao criar tarefa no serviço:', error);
    // Pode querer lançar um erro mais específico ou tratar diferentes tipos de erros da BD
    throw new Error('Não foi possível criar a tarefa na base de dados.');
  }
}

/**
 * Obtém uma tarefa específica pelo seu ID.
 * @param {number} taskId - O ID da tarefa a ser procurada.
 * @param {number} [userId] - (Opcional) O ID do utilizador para garantir que a tarefa pertence a ele.
 * @returns {Promise<Task|null>} A tarefa encontrada, ou null se não existir ou não pertencer ao utilizador.
 */
async function getTaskById(taskId, userId) {
  try {
    const queryOptions = {
      where: { id: taskId },
    };

    // Se um userId for fornecido, adicionamos à condição para garantir que
    // o utilizador só pode aceder às suas próprias tarefas.
    if (userId !== undefined) {
      queryOptions.where.userId = userId;
    }

    const task = await Task.findOne(queryOptions);
    return task; // Retorna a tarefa ou null se não for encontrada (ou não pertencer ao user)
  } catch (error) {
    console.error(`Erro ao obter tarefa por ID (${taskId}) no serviço:`, error);
    throw new Error('Não foi possível obter a tarefa da base de dados.');
  }
}

/**
 * Obtém todas as tarefas para um utilizador específico.
 * Poderia ser expandido para incluir paginação, filtros por status, prioridade, etc.
 * @param {number} userId - O ID do utilizador cujas tarefas devem ser obtidas.
 * @param {object} [filters={}] - (Opcional) Um objeto com filtros (ex: { status: 'pendente' }).
 * @returns {Promise<Task[]>} Uma lista das tarefas encontradas.
 */
async function getAllTasksByUserId(userId, filters = {}) {
  if (!userId) {
    throw new Error('ID do utilizador é obrigatório para obter tarefas.');
  }

  try {
    const queryOptions = {
      where: {
        userId: userId,
        ...filters, // Espalha quaisquer filtros adicionais (ex: status, priority)
      },
      // order: [['createdAt', 'DESC']], // Exemplo de ordenação
    };

    const tasks = await Task.findAll(queryOptions);
    return tasks;
  } catch (error) {
    console.error(`Erro ao obter todas as tarefas para o utilizador (${userId}) no serviço:`, error);
    throw new Error('Não foi possível obter as tarefas da base de dados.');
  }
}

/**
 * Atualiza uma tarefa existente.
 * Apenas o utilizador proprietário da tarefa pode atualizá-la.
 * @param {number} taskId - O ID da tarefa a ser atualizada.
 * @param {number} userId - O ID do utilizador que está a tentar atualizar a tarefa.
 * @param {object} updateData - Os dados a serem atualizados na tarefa (ex: { title, description, status }).
 * @returns {Promise<Task|null>} A tarefa atualizada, ou null se não for encontrada ou o utilizador não tiver permissão.
 * @throws {Error} Se ocorrer um erro durante a atualização.
 */
async function updateTask(taskId, userId, updateData) {
  console.log(`[TaskService] updateTask - Recebido taskId: ${taskId} (tipo: ${typeof taskId}), userId para permissão: ${userId} (tipo: ${typeof userId})`);
  console.log('[TaskService] updateTask - Dados brutos para atualizar:', updateData);

  try {
    // 1. Encontrar a tarefa para garantir que ela existe e pertence ao utilizador
    const taskToUpdate = await Task.findOne({
      where: { id: taskId, userId: userId },
    });

    console.log('[TaskService] updateTask - Resultado de Task.findOne (verificação inicial):', taskToUpdate ? taskToUpdate.toJSON() : null);

    if (!taskToUpdate) {
      console.log('[TaskService] updateTask - Tarefa não encontrada ou não pertence ao utilizador.');
      return null; // Retorna null se a tarefa não for encontrada ou não pertencer ao utilizador
    }

    // 2. Preparar os dados para atualização, removendo campos que não devem ser atualizados diretamente aqui
    const cleanUpdateData = { ...updateData };
    delete cleanUpdateData.userId_for_update_permission; // Campo de permissão temporário
    delete cleanUpdateData.id;                            // Não se deve permitir atualizar o ID
    delete cleanUpdateData.userId;                        // A propriedade da tarefa (userId) não deve ser mudada por aqui
    delete cleanUpdateData.createdAt;                     // Não se deve atualizar o createdAt
                                                          // O updatedAt será atualizado automaticamente pelo Sequelize

    console.log('[TaskService] updateTask - Dados limpos para taskInstance.update():', cleanUpdateData);

    // 3. Atualizar a instância encontrada com os novos dados e guardar
    // O método .update() na instância aplica as alterações e depois faz .save()
    // e retorna a instância atualizada.
    const updatedTask = await taskToUpdate.update(cleanUpdateData);

    console.log('[TaskService] updateTask - Tarefa após taskInstance.update():', updatedTask ? updatedTask.toJSON() : null);
    return updatedTask; // Retorna a instância da tarefa atualizada

  } catch (error) {
    console.error(`Erro ao atualizar tarefa (${taskId}) no serviço:`, error);
    // Pode querer verificar tipos específicos de erro do Sequelize aqui (ex: ValidationError)
    throw new Error('Não foi possível atualizar a tarefa na base de dados.');
  }
}

/**
 * Elimina uma tarefa.
 * Apenas o utilizador proprietário da tarefa pode eliminá-la.
 * @param {number} taskId - O ID da tarefa a ser eliminada.
 * @param {number} userId - O ID do utilizador que está a tentar eliminar a tarefa.
 * @returns {Promise<boolean>} True se a tarefa foi eliminada, false caso contrário (ex: não encontrada ou sem permissão).
 * @throws {Error} Se ocorrer um erro durante a eliminação.
 */
async function deleteTask(taskId, userId) {
  try {
    // Verifica se a tarefa existe e pertence ao utilizador antes de tentar eliminar
    // Esta verificação é importante para não apagar tarefas de outros por engano
    // e para dar um feedback mais preciso.
    const task = await Task.findOne({
      where: { id: taskId, userId: userId },
    });

    if (!task) {
      return false; // Tarefa não encontrada ou não pertence ao utilizador
    }

    const deletedRowsCount = await Task.destroy({
      where: { id: taskId, userId: userId },
    });

    return deletedRowsCount > 0; // Retorna true se uma ou mais linhas foram eliminadas
  } catch (error) {
    console.error(`Erro ao eliminar tarefa (${taskId}) no serviço:`, error);
    throw new Error('Não foi possível eliminar a tarefa da base de dados.');
  }
}

// Atualize o module.exports para incluir todas as funções CRUD
module.exports = {
  createTask,
  getTaskById,
  getAllTasksByUserId,
  updateTask,
  deleteTask,
};