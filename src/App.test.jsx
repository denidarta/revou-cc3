import { describe, it, expect, beforeEach, vi } from 'vitest'
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

  it('renders todo text as literal text, not HTML', () => {
    render(<App />)
    const markup = '<img src=x onerror=alert(1)>'
    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), { target: { value: markup } })
    fireEvent.click(screen.getByText('Add'))
    expect(screen.getByText(markup)).toBeInTheDocument()
    expect(document.querySelector('.todo-item img')).toBeNull()
  })

  it('writes todos to localStorage only when todos change', () => {
    render(<App />)
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const input = screen.getByPlaceholderText('What needs to be done?')
    fireEvent.change(input, { target: { value: 'Persist me' } })
    expect(setItem).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('Add'))
    expect(setItem).toHaveBeenCalledTimes(1)
    expect(JSON.parse(localStorage.getItem('todos'))[0].text).toBe('Persist me')
    setItem.mockRestore()
  })

  it.each(['{not json', 'null', '{}', '[null]'])('starts empty when stored todos are %s', (stored) => {
    localStorage.setItem('todos', stored)
    render(<App />)
    expect(screen.getByText('My Todo List')).toBeInTheDocument()
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
  })

  it('shows saved todos on load', () => {
    localStorage.setItem('todos', JSON.stringify([{ id: 1, text: 'Saved', completed: false }]))
    render(<App />)
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })
})
