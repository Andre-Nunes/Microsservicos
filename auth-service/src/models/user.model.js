// auth-service/src/models/user.model.js
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // O email deve ser único
      validate: {
        isEmail: true, // Validar formato do email
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Pode adicionar outros campos se o AuthService também gerir o perfil inicial
    // Ex: name, role, etc.
    // Por agora, focamos no essencial para autenticação.
    // O UserService (FM03) pode ter um modelo User mais completo ou estender este.
  }, {
    timestamps: true, // Adiciona createdAt e updatedAt
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        // Se a password for modificada, fazer o hash novamente
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  });

  // Método de instância para comparar passwords
  User.prototype.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  return User;
};