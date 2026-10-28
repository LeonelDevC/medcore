import { Compass } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button/Button'
import { Card } from '../../components/ui/Card/Card'
import { EmptyState } from '../../components/ui/EmptyState/EmptyState'
import './NotFoundPage.styles.sass'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="not-found-page">
      <Card>
        <EmptyState
          icon={Compass}
          title="Página no encontrada"
          description="La ruta solicitada no existe en el MVP."
        >
          <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
            Volver al dashboard
          </Button>
        </EmptyState>
      </Card>
    </div>
  )
}
