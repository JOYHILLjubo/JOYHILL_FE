import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SermonProvider } from './context/SermonContext'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// 배포 시 자동으로 새 service worker 감지 → 즉시 업데이트 적용
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SermonProvider>
          <App />
        </SermonProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
