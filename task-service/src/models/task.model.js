// task-service/src/models/task.model.js
module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    // O ID será criado automaticamente pelo Sequelize como uma chave primária auto-incrementada
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false, // O título é obrigatório
    },
    description: {
      type: DataTypes.TEXT, // Para descrições mais longas
      allowNull: true, // A descrição pode ser opcional
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pendente', // Valor padrão: 'pendente', 'em progresso', 'concluída'
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: true, // Prioridade pode ser opcional: 'baixa', 'média', 'alta'
      defaultValue: 'média',
    },
    dueDate: {
      type: DataTypes.DATE, // Data de conclusão
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER, // Assumindo que o ID do utilizador é um inteiro
      allowNull: false, // Toda tarefa deve pertencer a um utilizador
      // No futuro, poderíamos adicionar aqui uma referência (chave estrangeira)
      // à tabela de Utilizadores, se ela estivesse na mesma base de dados e
      // gerida pelo mesmo serviço, ou manter apenas o ID e validar a existência
      // do utilizador através do Serviço de Utilizadores.
      // references: {
      //   model: 'Users', // Nome da tabela de utilizadores
      //   key: 'id',
      // }
    },
    // Timestamps createdAt e updatedAt são adicionados automaticamente pelo Sequelize
    // se não os desativar explicitamente ou se não os definir aqui.
    // Se quiser nomes diferentes ou um comportamento específico:
    // createdAt: {
    //   type: DataTypes.DATE,
    //   allowNull: false,
    //   defaultValue: DataTypes.NOW,
    // },
    // updatedAt: {
    //   type: DataTypes.DATE,
    //   allowNull: false,
    //   defaultValue: DataTypes.NOW,
    // },
  }, {
    // Opções adicionais do modelo
    timestamps: true, // Ativa createdAt e updatedAt (default é true)
    // tableName: 'tasks', // Se quiser um nome de tabela diferente do pluralizado do nome do modelo
  });

  // Se tiver associações com outros modelos, defina-as aqui
  // Task.associate = (models) => {
  //   // Exemplo: Se houvesse um modelo User neste mesmo serviço
  //   Task.belongsTo(models.User, {
  //     foreignKey: 'userId',
  //     as: 'user',
  //   });
  // };

  return Task;
};