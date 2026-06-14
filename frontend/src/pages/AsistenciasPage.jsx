import AsistenciasView from '../views/AsistenciasView'
import { useAsistenciasController } from '../controllers/useAsistenciasController'

export default function AsistenciasPage() {
  const ctrl = useAsistenciasController()

  return <AsistenciasView state={ctrl.state} handlers={ctrl.handlers} />
}
