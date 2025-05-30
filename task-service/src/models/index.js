// task-service/src/models/index.js
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Determinar o ambiente (development, test, production)
const env = process.env.NODE_ENV || 'development';
// Carregar as configurações da base de dados para o ambiente atual
const config = require('../config/database.js')[env];

const db = {}; // Objeto para conter a instância do Sequelize e os modelos

let sequelize;
if (config.use_env_variable) {
  // Se estiver a usar uma variável de ambiente para a string de conexão (mais comum em produção)
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // Usar os parâmetros de configuração individuais
  sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    dialectOptions: config.dialectOptions,
    logging: env === 'development' ? console.log : false, // Logar queries SQL em desenvolvimento
  });
}

// Testar a ligação à base de dados
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Ligação à base de dados MariaDB estabelecida com sucesso.');
  } catch (error) {
    console.error('Não foi possível ligar à base de dados MariaDB:', error);
  }
}

// Só executa testConnection se não estiver no ambiente de teste
if (process.env.NODE_ENV !== 'test') {
  testConnection();
}

// Carregar todos os ficheiros de modelo desta pasta (exceto index.js e ficheiros de teste)
// Esta parte será mais útil quando tivermos os modelos definidos
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== path.basename(__filename) && // Não carregar o próprio index.js
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1 // Não carregar ficheiros de teste
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Configurar associações entre modelos (se existirem)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize; // Adicionar a instância configurada do Sequelize ao objeto db
db.Sequelize = Sequelize; // Adicionar a classe Sequelize ao objeto db

module.exports = db; // Exportar o objeto db