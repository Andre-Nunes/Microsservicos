// user-service/server.js
const express = require('express');
require('dotenv').config();
const db = require('./src/models');
const userProfileRoutes = require('./src/routes/userProfile.routes'); // Importar as rotas

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 3003;

app.use(express.json());

// Usar as rotas de perfil de utilizador com o prefixo /api/users
// As rotas definidas em userProfile.routes.js serão como /api/users/:userId/profile
app.use('/api/users', userProfileRoutes); 

app.get('/', (req, res) => {
  res.send('Serviço de Utilizadores está a funcionar! Use /api/users/:userId/profile para os perfis.');
});

if (require.main === module) {
  db.sequelize.sync({ force: false }) 
   .then(() => {
      console.log('Base de dados do UserService sincronizada.'); // Tabela UserProfiles já deve existir
      app.listen(PORT, () => {
        console.log(`Serviço de Utilizadores a escutar na porta ${PORT} e pronto para receber pedidos em /api/users`);
      });
    })
   .catch(err => {
      console.error('Erro ao sincronizar a base de dados do UserService:', err);
      process.exit(1);
    });
}

module.exports = app;