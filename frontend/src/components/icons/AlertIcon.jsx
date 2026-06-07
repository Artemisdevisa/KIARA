export default function AlertIcon({ size = 24, className = '' }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cuerpo de la campana */}
      <path
        d="M12 3 C9 3 7 5.5 7 8.5 V15 H17 V8.5 C17 5.5 15 3 12 3Z"
        fill="currentColor"
      />
      {/* Base de la campana */}
      <path
        d="M5.5 15 H18.5"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      />
      {/* Badajo */}
      <path
        d="M10 18 C10 18 10.5 20.5 12 20.5 C13.5 20.5 14 18 14 18"
        fill="currentColor"
      />
      {/* Punto de notificación */}
      <circle cx="17" cy="5" r="3" fill="#B7791F"/>
    </svg>
  )
}
