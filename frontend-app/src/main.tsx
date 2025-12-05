/**
 * Punto de entrada principal de la aplicación React
 * 
 * Este archivo inicializa la aplicación y monta el componente raíz
 * en el DOM. También configura los providers necesarios.
 * 
 * @author Sofía Castellanos Lobo
 * @module Frontend - S.D.P.I.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './styles/index.css'

// Obtener el elemento raíz del DOM
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('No se encontró el elemento root en el DOM')
}

// Crear la raíz de React y renderizar la aplicación
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* BrowserRouter para navegación SPA */}
    <BrowserRouter>
      {/* AuthProvider para manejo de autenticación JWT */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)


