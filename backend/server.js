const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: 'https://todo-frontend-4e7s.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// Basit bir GET isteği
app.get('/', (req, res) => {
    res.send('Merhaba, bu arka uç!');
});

// Todo'ları saklamak için basit bir dizi
let todos = [];

// Todo ekleme
app.post('/todos', (req, res) => {
    const { text } = req.body;
    const newTodo = { id: Date.now(), text, completed: false };
    todos.push(newTodo);
    res.status(201).json(newTodo);
});

// Todo'ları listeleme
app.get('/todos', (req, res) => {
    res.json(todos);
});

// Todo güncelleme
app.patch('/todos/:id', (req, res) => {
    const { id } = req.params;
    const todo = todos.find(t => t.id == id);
    if (todo) {
        todo.completed = !todo.completed;
        res.json(todo);
    } else {
        res.status(404).send('Todo bulunamadı');
    }
});

// Todo silme
app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    todos = todos.filter(t => t.id != id);
    res.status(204).send();
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
