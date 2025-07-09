require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

const users = [];

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Sevalla clone' });
});

app.get('/users', authenticateToken, (req, res) => {
  const sanitized = users.map(({ id, username }) => ({ id, username }));
  res.json(sanitized);
});

app.post('/users', authenticateToken, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }
  const id = users.length + 1;
  const hashed = bcrypt.hashSync(password, 8);
  users.push({ id, username, password: hashed });
  res.status(201).json({ id, username });
});

app.delete('/users/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return res.sendStatus(404);
  users.splice(index, 1);
  res.sendStatus(204);
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }
  const id = users.length + 1;
  const hashed = bcrypt.hashSync(password, 8);
  users.push({ id, username, password: hashed });
  res.status(201).json({ id, username });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: 'invalid credentials' });
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ error: 'invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'secret');
  res.json({ token });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
