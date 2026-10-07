import { useState, useEffect, useMemo } from 'react'

function App() {
  const [todos, setTodos] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('todos'))
      return Array.isArray(saved) ? saved.filter(t => t && typeof t === 'object') : []
    } catch {
      return []
    }
  })
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('all')
  
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])
  
  const addTodo = () => {
    if (input.trim() === '') {
      alert('Please enter a todo')
      return
    }
    
    const newTodo = {
      id: crypto.randomUUID(),
      text: input,
      completed: false
    }
    
    setTodos([...todos, newTodo])
    setInput('')
  }
  
  // Issue 7: Tidak ada error handling
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }
  
  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }
  
  const visibleTodos = useMemo(
    () => filter === 'all' ? todos : todos.filter(t => Boolean(t.completed) === (filter === 'completed')),
    [todos, filter]
  )
  
  const completedCount = useMemo(() => todos.filter(t => t.completed).length, [todos])
  
  return (
    <div className="app">
      <h1>My Todo List</h1>
      
      <form className="input-section" onSubmit={e => { e.preventDefault(); addTodo() }}>
        <input 
          type="text"
          aria-label="New todo"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button type="submit">Add</button>
      </form>
      
      <div className="filters">
        {['all', 'active', 'completed'].map(f => (
          <button
            key={f}
            type="button"
            className={filter === f ? 'active' : undefined}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      
      <div className="todo-list">
        {/* Issue 13: Tidak ada handling untuk empty state */}
        {visibleTodos.map((todo) => (
          // Issue 14: Key menggunakan index bisa lebih baik dengan ID
          <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <input 
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              aria-label={`Complete "${todo.text}"`}
            />
            <span>{todo.text}</span>
            <button 
              className="delete-btn"
              onClick={() => deleteTodo(todo.id)}
              aria-label={`Delete "${todo.text}"`}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      
      <div className="stats">
        <p>Total: {todos.length} | Active: {todos.length - completedCount} | Completed: {completedCount}</p>
      </div>
    </div>
  )
}

export default App
