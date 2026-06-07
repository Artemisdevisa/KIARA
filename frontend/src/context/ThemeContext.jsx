import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    const html = document.documentElement
    const body = document.body

    if (dark) {
      html.classList.add('dark')
      body.style.backgroundColor = '#1e2433'
      body.style.color = '#e2e8f0'
      localStorage.setItem('theme', 'dark')
    } else {
      html.classList.remove('dark')
      body.style.backgroundColor = '#FAFAF7'
      body.style.color = '#1B1B1B'
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
