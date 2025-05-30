// auth-service/src/config/database.js
require('dotenv').config({ path: '../../.env' }); // Aponta para o .env na raiz do auth-service

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'task_management_db', // Usaremos a mesma base de dados
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mariadb',
    dialectOptions: {
      timezone: 'Etc/GMT-1', // Ou o seu fuso horário
    },
  },
  test: {
    username: process.env.DB_TEST_USERNAME || 'root',
    password: process.env.DB_TEST_PASSWORD || null,
    database: process.env.DB_TEST_NAME || 'task_management_test_db', // BD de teste
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mariadb',
    logging: false,
  },
  production: {
    username: process.env.DB_PROD_USERNAME,
    password: process.env.DB_PROD_PASSWORD,
    database: process.env.DB_PROD_NAME,
    host: process.env.DB_PROD_HOST,
    port: parseInt(process.env.DB_PROD_PORT),
    dialect: 'mariadb',
    logging: false,
  },
};