import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  
  it('renders todo app title', () => {
    render(<App />)
    expect(screen.getByText('My Todo List')).toBeInTheDocument()
  })
  
  it('can add a new todo', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('What needs to be done?')
    const addButton = screen.getByText('Add')
    
    fireEvent.change(input, { target: { value: 'Test todo' } })
    fireEvent.click(addButton)
    
    expect(screen.getByText('Test todo')).toBeInTheDocument()
  })
  
  it('can toggle todo completion', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('What needs to be done?')
    const addButton = screen.getByText('Add')
    
    fireEvent.change(input, { target: { value: 'Test todo' } })
    fireEvent.click(addButton)
    
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    
    expect(checkbox).toBeChecked()
  })
  
  it('can delete a todo', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('What needs to be done?')
    const addButton = screen.getByText('Add')
    
    fireEvent.change(input, { target: { value: 'Test todo' } })
    fireEvent.click(addButton)
    
    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)
    
    expect(screen.queryByText('Test todo')).not.toBeInTheDocument()
  })
  
  it('shows correct stats', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('What needs to be done?')
    const addButton = screen.getByText('Add')
    
    fireEvent.change(input, { target: { value: 'Todo 1' } })
    fireEvent.click(addButton)
    
    fireEvent.change(input, { target: { value: 'Todo 2' } })
    fireEvent.click(addButton)
    
    expect(screen.getByText(/Total: 2/)).toBeInTheDocument()
    expect(screen.getByText(/Active: 2/)).toBeInTheDocument()
  })

  it('filters todos and updates stats after a toggle', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('What needs to be done?')
    fireEvent.change(input, { target: { value: 'A' } })
    fireEvent.click(screen.getByText('Add'))
    fireEvent.change(input, { target: { value: 'B' } })
    fireEvent.click(screen.getByText('Add'))
    fireEvent.click(screen.getAllByRole('checkbox')[0])

    expect(screen.getByText('Total: 2 | Active: 1 | Completed: 1')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Active' }))
    expect(screen.queryByText('A')).not.toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Completed' }))
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.queryByText('B')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'All' }))
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('lists a stored todo without a completed flag as active', () => {
    localStorage.setItem('todos', JSON.stringify([{ id: 1, text: 'Legacy' }]))
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Active' }))
    expect(screen.getByText('Legacy')).toBeInTheDocument()
  })
})
