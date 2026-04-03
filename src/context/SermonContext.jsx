import { createContext, useContext, useState } from 'react'

const SermonContext = createContext()

export function SermonProvider({ children }) {
  const [sermon, setSermon] = useState(null)
  return (
    <SermonContext.Provider value={{ sermon, setSermon }}>
      {children}
    </SermonContext.Provider>
  )
}

export function useSermon() {
  return useContext(SermonContext)
}
