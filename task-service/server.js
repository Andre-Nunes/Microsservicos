// server.js
const express = require('express');
require('dotenv').config();
const db = require('./src/models');
const taskRoutes = require('./src/routes/task.routes');

const app = express(); // Criar a instância da app
const PORT = process.env.TASK_SERVICE_PORT || 3001;

app.use(express.json());
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.send('Serviço de Tarefas está a funcionar! Use /api/tasks para as funcionalidades.');
});

// Sincronizar e iniciar o servidor APENAS se este ficheiro for executado diretamente
// Isto permite que importemos 'app' noutros ficheiros (como os de teste) sem iniciar o servidor.
if (require.main === module) {
  db.sequelize.sync({ force: false }) 
   .then(() => {
      console.log('Base de dados sincronizada.');
      app.listen(PORT, () => {
        console.log(`Serviço de Tarefas a escutar na porta ${PORT} e pronto para receber pedidos em /api/tasks`);
      });
    })
   .catch(err => {
      console.error('Erro ao sincronizar a base de dados:', err);
      process.exit(1); // Sair se a BD não sincronizar
    });
}

module.exports = app; // Exportar a app para ser usada pelos testes