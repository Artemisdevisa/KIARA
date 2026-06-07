export default function UserIcon({ size = 24, className = '' }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cabeza */}
      <circle cx="12" cy="7.5" r="3.5" fill="currentColor"/>
      {/* Cuerpo / hombros */}
      <path
        d="M4.5 21 C4.5 16.5 7.9 13 12 13 C16.1 13 19.5 16.5 19.5 21"
        fill="currentColor" opacity="0.7"
      />
      {/* Sombrero de agricultor */}
      <path
        d="M8 5 C8 5 9 3 12 3 C15 3 16 5 16 5"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"
      />
    </svg>
  )
}
