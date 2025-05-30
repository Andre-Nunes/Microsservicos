// task-service/src/config/database.js
require('dotenv').config(); // Para carregar variáveis de ambiente do ficheiro .env

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'root', // Seu nome de utilizador da MariaDB
    password: process.env.DB_PASSWORD || null,  // Sua password da MariaDB (null se não tiver)
    database: process.env.DB_NAME || 'task_management_db', // Nome da base de dados
    host: process.env.DB_HOST || '127.0.0.1', // Host da MariaDB (localhost)
    port: process.env.DB_PORT || 3306,       // Porta da MariaDB
    dialect: 'mariadb', // Especificar o dialeto para Sequelize
    dialectOptions: {
      timezone: 'Etc/GMT-1', // Ou o seu fuso horário, ex: 'Europe/Lisbon'
    },
  },
  test: {
    // Configurações para ambiente de teste (pode ser uma BD em memória ou outra)
    username: process.env.DB_TEST_USERNAME || 'root',
    password: process.env.DB_TEST_PASSWORD || null,
    database: process.env.DB_TEST_NAME || 'task_management_test_db',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mariadb',
    logging: false, // Desativar logs SQL para testes
  },
  production: {
    // Configurações para ambiente de produção (usará variáveis de ambiente)
    username: process.env.DB_PROD_USERNAME,
    password: process.env.DB_PROD_PASSWORD,
    database: process.env.DB_PROD_NAME,
    host: process.env.DB_PROD_HOST,
    port: process.env.DB_PROD_PORT,
    dialect: 'mariadb',
    logging: false, // Desativar logs SQL em produção, ou usar um logger customizado
  },
};