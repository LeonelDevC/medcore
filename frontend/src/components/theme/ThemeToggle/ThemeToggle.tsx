import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../../hooks/useTheme'
import { cx } from '../../../lib/utils'
import './ThemeToggle.styles.sass'

/**
 * Switch claro/oscuro con etiqueta textual (§4.1: no solo icono).
 * Alterna `data-theme` y persiste la elección en localStorage (T1, C11).
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const label = isDark ? 'Oscuro' : 'Claro'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Tema ${label.toLowerCase()}. Cambiar a tema ${isDark ? 'claro' : 'oscuro'}`}
      onClick={toggleTheme}
      className={cx('theme-toggle', isDark && 'theme-toggle--dark')}
    >
      {isDark ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
      <span className="theme-toggle__label">{label}</span>

      <span aria-hidden="true" className="theme-toggle__track">
        <span className="theme-toggle__thumb" />
      </span>
    </button>
  )
}
