import { render, screen } from '@testing-library/react'
import App from './App'

test('แสดงชื่อแอป', () => {
  render(<App />)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('เรียน CCNA แบบเข้าใจจริง')
})
