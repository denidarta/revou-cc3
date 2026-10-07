import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

const add = (text) => {
  fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), { target: { value: text } })
  fireEvent.click(screen.getByText('Add'))
}

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
    add('Test todo')
    
    expect(screen.getByText('Test todo')).toBeInTheDocument()
  })
  
  it('can toggle todo completion', () => {
    render(<App />)
    add('Test todo')
    
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    
    expect(checkbox).toBeChecked()
  })
  
  it('can delete a todo', () => {
    render(<App />)
    add('Test todo')
    
    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)
    
    expect(screen.queryByText('Test todo')).not.toBeInTheDocument()
  })
  
  it('shows correct stats', () => {
    render(<App />)
    add('Todo 1')
    add('Todo 2')
    
    expect(screen.getByText(/Total: 2/)).toBeInTheDocument()
    expect(screen.getByText(/Active: 2/)).toBeInTheDocument()
  })
})
