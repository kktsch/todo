import { useEffect, useState } from 'react'
import './App.css'
import { fetchTodos, addTodo, toggleTodo, deleteTodo } from './services/DataService'

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')

  // Todo'ları yükle
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const todosData = await fetchTodos()
        setTodos(todosData)
      } catch (error) {
        console.error(error)
      }
    }
    loadTodos()
  }, [])

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodo.trim() === '') return

    try {
      const addedTodo = await addTodo(newTodo)
      setTodos([...todos, addedTodo])
      setNewTodo('')
    } catch (error) {
      console.error(error)
    }
  }

  const handleToggleTodo = async (id: number) => {
    try {
      const updatedTodo = await toggleTodo(id)
      setTodos(todos.map(todo => (todo.id === id ? updatedTodo : todo)))
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteTodo = async (id: number) => {
    try {
      await deleteTodo(id)
      setTodos(todos.filter(todo => todo.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="app">
      <h1>Yapılacaklar Listesi</h1>
      
      <form onSubmit={handleAddTodo} className="todo-form">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Yeni görev ekle..."
          className="todo-input"
        />
        <button type="submit" className="add-button">Ekle</button>
      </form>

      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className="todo-item">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleTodo(todo.id)}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => handleDeleteTodo(todo.id)} className="delete-button">
              Sil
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
