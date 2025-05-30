// user-service/src/config/database.js
require('dotenv').config({ path: '../../.env' }); // Aponta para o .env na raiz do user-service

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'task_management_db', // Mesma base de dados
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mariadb',
    dialectOptions: {
      timezone: 'Etc/GMT-1', // Ou o seu fuso horário
    },
  },
  test: { /* ... configurações de teste ... */ },
  production: { /* ... configurações de produção ... */ },
};