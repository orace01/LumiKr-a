import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/onest/index.css'
import '@fontsource/sacramento/400.css'
import './styles/global.css'
import App from './App.tsx'
// Grands écrans (R-009) : en dernier, après le CSS des composants importé par App.
import './styles/grands-ecrans.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
