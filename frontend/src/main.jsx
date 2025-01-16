import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import Analyse from './components/Analyse';
import Comparaison from './components/Comparaison.jsx';
import Clustering from './components/Clustering.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/Analyse" element={<Analyse />} />
        <Route path="/Comparaison" element={<Comparaison />} />
        <Route path="/Clustering" element={<Clustering />} />
        
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
