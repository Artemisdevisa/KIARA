export default function SunIcon({ size = 24, className = '' }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Núcleo solar */}
      <circle cx="12" cy="12" r="4.5" fill="currentColor"/>
      {/* Rayos — 8 líneas */}
      <path d="M12 1.5V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 20V22.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M1.5 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 12H22.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M4.4 4.4L6.2 6.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17.8 17.8L19.6 19.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M19.6 4.4L17.8 6.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M6.2 17.8L4.4 19.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
