import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

/* Layouts */
import PublicLayout from './components/layout/PublicLayout'
import Layout from './components/layout/Layout'

/* Páginas públicas (landing + marketing) */
import LandingPage from './pages/LandingPage'
import MarketplacePage from './pages/MarketplacePage'
import QuienesSomosPage from './pages/QuienesSomosPage'
import ComoFuncionaPage from './pages/ComoFuncionaPage'
import ContactoPage from './pages/ContactoPage'

/* Auth */
import Login from './pages/Login'
import Register from './pages/Register'

/* App protegida */
import Dashboard from './pages/Dashboard'
import BiohuertosPage from './pages/biohuertos/BiohuertosPage'
import BiohuertosForm from './pages/biohuertos/BiohuertosForm'
import BiohuertosDetail from './pages/biohuertos/BiohuertosDetail'
import CultivosPage from './pages/cultivos/CultivosPage'
import CultivosForm from './pages/cultivos/CultivosForm'
import CultivosDetail from './pages/cultivos/CultivosDetail'
import MonitoreoPage from './pages/monitoreo/MonitoreoPage'
import AlertasPage from './pages/alertas/AlertasPage'
import DiagnosticoPage from './pages/diagnostico/DiagnosticoPage'
import CosechasPage from './pages/cosechas/CosechasPage'
import CosechasForm from './pages/cosechas/CosechasForm'
import TrazabilidadPage from './pages/trazabilidad/TrazabilidadPage'
import RecomendacionesPage from './pages/recomendaciones/RecomendacionesPage'
import AdministrativoPage from './pages/administrativo/AdministrativoPage'
import UsuariosPage from './pages/usuarios/UsuariosPage'

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* ── Páginas públicas con Header + Footer ── */}
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="quienes-somos" element={<QuienesSomosPage />} />
        <Route path="como-funciona" element={<ComoFuncionaPage />} />
        <Route path="contacto" element={<ContactoPage />} />
      </Route>

      {/* ── Auth (sin layout) ── */}
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />

      {/* ── App protegida con Sidebar ── */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="biohuertos" element={<BiohuertosPage />} />
        <Route path="biohuertos/nuevo" element={<BiohuertosForm />} />
        <Route path="biohuertos/:id" element={<BiohuertosDetail />} />
        <Route path="biohuertos/:id/editar" element={<BiohuertosForm />} />
        <Route path="cultivos" element={<CultivosPage />} />
        <Route path="cultivos/nuevo" element={<CultivosForm />} />
        <Route path="cultivos/:id" element={<CultivosDetail />} />
        <Route path="monitoreo" element={<MonitoreoPage />} />
        <Route path="alertas" element={<AlertasPage />} />
        <Route path="diagnostico" element={<DiagnosticoPage />} />
        <Route path="cosechas" element={<CosechasPage />} />
        <Route path="cosechas/nueva" element={<CosechasForm />} />
        <Route path="trazabilidad" element={<TrazabilidadPage />} />
        <Route path="recomendaciones" element={<RecomendacionesPage />} />
        <Route path="administrativo" element={<AdministrativoPage />} />
        <Route path="usuarios" element={<UsuariosPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
