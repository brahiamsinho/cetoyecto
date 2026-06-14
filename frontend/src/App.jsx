import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'

import LoginView from './views/LoginView'
import ForgotPasswordView from './views/ForgotPasswordView'
import ResetPasswordView from './views/ResetPasswordView'
import DashboardView from './views/DashboardView'
import PostulantesView from './views/PostulantesView'
import { PostulanteFormWrapper } from './views/PostulanteFormView'
import { PostulanteDetalleWrapper } from './views/PostulanteDetalleView'
import NotasView from './views/NotasView'
import { NotasPostulanteWrapper } from './views/NotasPostulanteView'
import PromediosView from './views/PromediosView'
import CarrerasView from './views/CarrerasView'
import GruposView from './views/GruposView'
import { GrupoDetalleWrapper } from './views/GrupoDetalleView'
import DocentesView from './views/DocentesView'
import { DocenteFormWrapper } from './views/DocenteFormView'
import CargaHorariaView from './views/CargaHorariaView'
import AsistenciasView from './views/AsistenciasView'
import AulasView from './views/AulasView'
import MateriasView from './views/MateriasView'
import HorariosView from './views/HorariosView'
import ReportesView from './views/ReportesView'
import UsuariosView from './views/UsuariosView'
import ImportacionesView from './views/ImportacionesView'
import BitacoraView from './views/BitacoraView'

import { useLoginController } from './controllers/useLoginController'
import { useForgotPasswordController } from './controllers/useForgotPasswordController'
import { useResetPasswordController } from './controllers/useResetPasswordController'
import { useDashboardController } from './controllers/useDashboardController'
import { usePostulantesController } from './controllers/usePostulantesController'
import { useNotasController } from './controllers/useNotasController'
import { usePromediosController } from './controllers/usePromediosController'
import { useCarrerasController } from './controllers/useCarrerasController'
import { useGruposController } from './controllers/useGruposController'
import { useDocentesController } from './controllers/useDocentesController'
import { useCargaHorariaController } from './controllers/useCargaHorariaController'
import { useAsistenciasController } from './controllers/useAsistenciasController'
import { useAulasController } from './controllers/useAulasController'
import { useMateriasController } from './controllers/useMateriasController'
import { useHorariosController } from './controllers/useHorariosController'
import { useReportesController } from './controllers/useReportesController'
import { useUsuariosController } from './controllers/useUsuariosController'
import { useImportacionesController } from './controllers/useImportacionesController'
import { useBitacoraController } from './controllers/useBitacoraController'

function RouteWrapper({ View, useCtrl }) {
  const ctrl = useCtrl()
  return <View {...ctrl} />
}

export default function App() {
  const location = useLocation()
  return (
    <Routes>
      <Route path="/login" element={<RouteWrapper key={location.pathname} View={LoginView} useCtrl={useLoginController} />} />
      <Route path="/forgot-password" element={<RouteWrapper key={location.pathname} View={ForgotPasswordView} useCtrl={useForgotPasswordController} />} />
      <Route path="/reset-password" element={<RouteWrapper key={location.pathname} View={ResetPasswordView} useCtrl={useResetPasswordController} />} />
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<RouteWrapper key={location.pathname} View={DashboardView} useCtrl={useDashboardController} />} />
        <Route path="postulantes" element={<PrivateRoute><RouteWrapper key={location.pathname} View={PostulantesView} useCtrl={usePostulantesController} /></PrivateRoute>} />
        <Route path="postulantes/nuevo" element={<PrivateRoute><PostulanteFormWrapper /></PrivateRoute>} />
        <Route path="postulantes/:id" element={<PrivateRoute><PostulanteDetalleWrapper /></PrivateRoute>} />
        <Route path="postulantes/:id/editar" element={<PrivateRoute><PostulanteFormWrapper /></PrivateRoute>} />
        <Route path="notas" element={<PrivateRoute><RouteWrapper key={location.pathname} View={NotasView} useCtrl={useNotasController} /></PrivateRoute>} />
        <Route path="notas/:postulanteId" element={<PrivateRoute><NotasPostulanteWrapper /></PrivateRoute>} />
        <Route path="promedios" element={<PrivateRoute><RouteWrapper key={location.pathname} View={PromediosView} useCtrl={usePromediosController} /></PrivateRoute>} />
        <Route path="carreras" element={<PrivateRoute><RouteWrapper key={location.pathname} View={CarrerasView} useCtrl={useCarrerasController} /></PrivateRoute>} />
        <Route path="grupos" element={<PrivateRoute><RouteWrapper key={location.pathname} View={GruposView} useCtrl={useGruposController} /></PrivateRoute>} />
        <Route path="grupos/:id" element={<PrivateRoute><GrupoDetalleWrapper /></PrivateRoute>} />
        <Route path="docentes" element={<PrivateRoute><RouteWrapper key={location.pathname} View={DocentesView} useCtrl={useDocentesController} /></PrivateRoute>} />
        <Route path="docentes/nuevo" element={<PrivateRoute><DocenteFormWrapper /></PrivateRoute>} />
        <Route path="carga-horaria" element={<PrivateRoute><RouteWrapper key={location.pathname} View={CargaHorariaView} useCtrl={useCargaHorariaController} /></PrivateRoute>} />
        <Route path="asistencias" element={<PrivateRoute><RouteWrapper key={location.pathname} View={AsistenciasView} useCtrl={useAsistenciasController} /></PrivateRoute>} />
        <Route path="aulas" element={<PrivateRoute><RouteWrapper key={location.pathname} View={AulasView} useCtrl={useAulasController} /></PrivateRoute>} />
        <Route path="materias" element={<PrivateRoute><RouteWrapper key={location.pathname} View={MateriasView} useCtrl={useMateriasController} /></PrivateRoute>} />
        <Route path="horarios" element={<PrivateRoute><RouteWrapper key={location.pathname} View={HorariosView} useCtrl={useHorariosController} /></PrivateRoute>} />
        <Route path="reportes" element={<PrivateRoute><RouteWrapper key={location.pathname} View={ReportesView} useCtrl={useReportesController} /></PrivateRoute>} />
        <Route path="usuarios" element={<PrivateRoute roles={['CPD']}><RouteWrapper key={location.pathname} View={UsuariosView} useCtrl={useUsuariosController} /></PrivateRoute>} />
        <Route path="importaciones" element={<PrivateRoute roles={['CPD']}><RouteWrapper key={location.pathname} View={ImportacionesView} useCtrl={useImportacionesController} /></PrivateRoute>} />
        <Route path="bitacora" element={<PrivateRoute roles={['CPD']}><RouteWrapper key={location.pathname} View={BitacoraView} useCtrl={useBitacoraController} /></PrivateRoute>} />
      </Route>
    </Routes>
  )
}
