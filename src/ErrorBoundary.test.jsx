import { it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'

function Boom() {
  throw new Error('boom')
}

it('shows the fallback when a child throws', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  render(<ErrorBoundary><Boom /></ErrorBoundary>)
  expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please reload the page.')
  vi.restoreAllMocks()
})

it('renders children when nothing throws', () => {
  render(<ErrorBoundary><p>ok</p></ErrorBoundary>)
  expect(screen.getByText('ok')).toBeInTheDocument()
})
