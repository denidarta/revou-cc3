import { describe, it, expect, beforeEach, vi } from 'vitest'
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

  it('keeps todos added in the same millisecond distinct', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1)
    render(<App />)
    const input = screen.getByPlaceholderText('What needs to be done?')
    fireEvent.change(input, { target: { value: 'A' } })
    fireEvent.click(screen.getByText('Add'))
    fireEvent.change(input, { target: { value: 'B' } })
    fireEvent.click(screen.getByText('Add'))
    const [first, second] = screen.getAllByRole('checkbox')
    fireEvent.click(first)
    expect(first).toBeChecked()
    expect(second).not.toBeChecked()
    vi.restoreAllMocks()
  })

  it('does not store createdAt', () => {
    render(<App />)
    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), { target: { value: 'A' } })
    fireEvent.click(screen.getByText('Add'))
    expect(JSON.parse(localStorage.getItem('todos'))[0]).not.toHaveProperty('createdAt')
  })

  it('gives each control an accessible name', () => {
    render(<App />)
    fireEvent.change(screen.getByRole('textbox', { name: 'New todo' }), { target: { value: 'Buy milk' } })
    fireEvent.click(screen.getByText('Add'))
    expect(screen.getByRole('checkbox', { name: 'Complete "Buy milk"' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete "Buy milk"' })).toBeInTheDocument()
  })

  it('adds a todo when the form is submitted', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('What needs to be done?')
    fireEvent.change(input, { target: { value: 'Via Enter' } })
    fireEvent.submit(input.closest('form'))
    expect(screen.getByText('Via Enter')).toBeInTheDocument()
  })

  it('alerts and adds nothing on blank submit', () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {})
    render(<App />)
    const input = screen.getByPlaceholderText('What needs to be done?')
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.submit(input.closest('form'))
    expect(alert).toHaveBeenCalledWith('Please enter a todo')
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
    vi.restoreAllMocks()
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

  it('marks the active filter with aria-pressed', () => {
    render(<App />)
    const all = screen.getByRole('button', { name: 'All' })
    const active = screen.getByRole('button', { name: 'Active' })
    expect(all).toHaveAttribute('aria-pressed', 'true')
    expect(active).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(active)
    expect(active).toHaveAttribute('aria-pressed', 'true')
    expect(all).toHaveAttribute('aria-pressed', 'false')
  })
})
