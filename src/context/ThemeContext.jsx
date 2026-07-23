import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

const STORAGE_KEY = 'joyhill.theme'
const THEMES = ['light', 'dark', 'sepia']

function getInitialTheme() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (THEMES.includes(stored)) return stored
  } catch { /* ignore */ }
  return 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch { /* ignore */ }
  }, [theme])

  const setTheme = (next) => {
    if (THEMES.includes(next)) setThemeState(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
