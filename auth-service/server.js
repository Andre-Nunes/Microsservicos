// auth-service/server.js
const express = require('express');
require('dotenv').config();
const db = require('./src/models');
const authRoutes = require('./src/routes/auth.routes'); // Importar as rotas de autenticação

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3002;

app.use(express.json()); // Middleware para JSON

// Usar as rotas de autenticação com um prefixo
// Todos os endpoints definidos em auth.routes.js serão prefixados com /api/auth
app.use('/api/auth', authRoutes); 

app.get('/', (req, res) => {
  res.send('Serviço de Autenticação está a funcionar! Use /api/auth para registo/login.');
});

if (require.main === module) {
  db.sequelize.sync({ force: false }) 
   .then(() => {
      console.log('Base de dados do AuthService sincronizada.');
      app.listen(PORT, () => {
        console.log(`Serviço de Autenticação a escutar na porta ${PORT} e pronto para receber pedidos em /api/auth`);
      });
    })
   .catch(err => {
      console.error('Erro ao sincronizar a base de dados do AuthService:', err);
      process.exit(1);
    });
}

module.exports = app;