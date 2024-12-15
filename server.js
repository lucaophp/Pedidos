import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pedidos_db',
  port: process.env.DB_PORT || 3306,
  ssl: {
    rejectUnauthorized: false
  },
  multipleStatements: true,
  dateStrings: true,
  timezone: 'UTC',
  decimalNumbers: true,
  supportBigNumbers: true,
  bigNumberStrings: true,
  namedPlaceholders: true,
  waitForConnections: true,
  queueLimit: 0
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err);
    return;
  }
  console.log('Conectado ao MySQL');
});

// Rota para buscar todos os produtos
app.get('/api/produtos', (req, res) => {
  const query = 'SELECT * FROM produtos WHERE ativo = 1';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar produtos:', err);
      res.status(500).json({ error: 'Erro ao buscar produtos' });
      return;
    }
    res.json(results);
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 