// user-service/src/models/userProfile.model.js
module.exports = (sequelize, DataTypes) => {
  const UserProfile = sequelize.define('UserProfile', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: { // Chave estrangeira que referencia o ID da tabela Users
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Cada utilizador só tem um perfil
      references: {
        model: 'Users', // Nome da tabela de utilizadores criada pelo AuthService
        key: 'id',     // Coluna 'id' na tabela 'Users'
      },
      onUpdate: 'CASCADE', // Se o ID do utilizador mudar na tabela Users, atualiza aqui
      onDelete: 'CASCADE', // Se o utilizador for eliminado na tabela Users, elimina o perfil também
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true, // Nome pode ser opcional inicialmente
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true, // Validar se é um URL (opcional)
      },
    },
    // Adicione outros campos de perfil que desejar, ex: data de nascimento, localização, etc.
    // createdAt e updatedAt são adicionados automaticamente pelo Sequelize
  }, {
    timestamps: true,
    tableName: 'UserProfiles', // Define explicitamente o nome da tabela
  });

  // Associações (se necessário definir explicitamente do lado do UserProfile)
  // UserProfile.associate = (models) => {
  //   // Assumindo que o modelo User também seria carregado aqui se estivéssemos a definir
  //   // a associação bidirecional completa dentro deste serviço.
  //   // No entanto, a referência já está definida em 'userId'.
  //   // UserProfile.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  // };

  return UserProfile;
};