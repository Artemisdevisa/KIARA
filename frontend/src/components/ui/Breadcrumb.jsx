import { useNavigate } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function Breadcrumb({ items }) {
  const navigate = useNavigate()
  const { dark }  = useTheme()

  return (
    <nav className="flex items-center gap-1 flex-wrap mb-1">
      <button onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
        style={{ color: dark ? 'rgba(255,255,255,0.40)' : '#9ca3af', backgroundColor: 'transparent' }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'; e.currentTarget.style.color = dark ? 'rgba(255,255,255,0.75)' : '#374151' }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = dark ? 'rgba(255,255,255,0.40)' : '#9ca3af' }}>
        <Home size={12} />
      </button>

      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight size={12} style={{ color: dark ? 'rgba(255,255,255,0.20)' : '#d1d5db', flexShrink: 0 }} />
            {isLast ? (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{
                  color: dark ? 'rgba(255,255,255,0.90)' : '#111827',
                  backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6',
                }}>
                {item.label}
              </span>
            ) : (
              <button onClick={() => navigate(item.to)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                style={{ color: dark ? 'rgba(255,255,255,0.40)' : '#9ca3af', backgroundColor: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'; e.currentTarget.style.color = dark ? 'rgba(255,255,255,0.75)' : '#374151' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = dark ? 'rgba(255,255,255,0.40)' : '#9ca3af' }}>
                {item.label}
              </button>
            )}
          </span>
        )
      })}
    </nav>
  )
}
