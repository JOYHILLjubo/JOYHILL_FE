import { createContext, useContext, useState } from 'react'

const SermonContext = createContext()

const DEFAULT_SERMON = {
  title: '흔들리지 않는 믿음',
  verse: '히브리서 11:1-6',
  preacher: '김목사',
  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  summary: '믿음은 바라는 것들의 실상이요 보이지 않는 것들의 증거니...',
}

export function SermonProvider({ children }) {
  const [sermon, setSermon] = useState(DEFAULT_SERMON)
  return (
    <SermonContext.Provider value={{ sermon, setSermon }}>
      {children}
    </SermonContext.Provider>
  )
}

export function useSermon() {
  return useContext(SermonContext)
}
