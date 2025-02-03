require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: 'https://todo-frontend-4e7s.onrender.com',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Listeleri ve todo'ları saklamak için veri yapıları
let lists = [];
let todos = [];

// Liste oluşturma
app.post('/lists', (req, res) => {
  const { title } = req.body;
  const newList = {
    id: Date.now(),
    title,
    createdAt: new Date().toISOString()
  };
  lists.push(newList);
  res.status(201).json(newList);
});

// Listeleri getirme
app.get('/lists', (req, res) => {
  res.json(lists);
});

// Liste güncelleme
app.patch('/lists/:id', (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const list = lists.find(l => l.id == id);
  if (list) {
    list.title = title;
    res.json(list);
  } else {
    res.status(404).send('Liste bulunamadı');
  }
});

// Liste silme
app.delete('/lists/:id', (req, res) => {
  const { id } = req.params;
  lists = lists.filter(l => l.id != id);
  // İlgili listeye ait tüm todo'ları da sil
  todos = todos.filter(t => t.listId != id);
  res.status(204).send();
});

// Todo ekleme
app.post('/lists/:listId/todos', (req, res) => {
  const { listId } = req.params;
  const { text } = req.body;
  const list = lists.find(l => l.id == listId);
  if (!list) {
    return res.status(404).send('Liste bulunamadı');
  }
  
  const maxOrder = todos
    .filter(t => t.listId == listId)
    .reduce((max, todo) => Math.max(max, todo.order), -1);
    
  const newTodo = {
    id: Date.now(),
    listId: parseInt(listId),
    text,
    completed: false,
    order: maxOrder + 1
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// Liste'ye ait todo'ları getirme
app.get('/lists/:listId/todos', (req, res) => {
  const { listId } = req.params;
  const listTodos = todos
    .filter(t => t.listId == listId)
    .sort((a, b) => a.order - b.order);
  res.json(listTodos);
});

// Diğer todo endpoint'leri güncellendi
app.patch('/lists/:listId/todos/:id', (req, res) => {
  const { listId, id } = req.params;
  const todo = todos.find(t => t.listId == listId && t.id == id);
  if (todo) {
    if (req.body.text !== undefined) todo.text = req.body.text;
    if (req.body.completed !== undefined) todo.completed = !todo.completed;
    if (req.body.order !== undefined) todo.order = req.body.order;
    
    todos.sort((a, b) => a.order - b.order);
    res.json(todo);
  } else {
    res.status(404).send('Todo bulunamadı');
  }
});

app.delete('/lists/:listId/todos/:id', (req, res) => {
  const { listId, id } = req.params;
  todos = todos.filter(t => !(t.listId == listId && t.id == id));
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});