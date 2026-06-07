export default function HarvestIcon({ size = 24, className = '' }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Espiga central */}
      <path d="M12 20V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      {/* Grano superior */}
      <ellipse cx="12" cy="5.5" rx="2" ry="3" fill="currentColor"/>
      {/* Hojuelas laterales izquierdas */}
      <path d="M12 14 C12 14 8 13 7 10 C8.5 8 11 9 12 14Z" fill="currentColor" opacity="0.65"/>
      <path d="M12 11 C12 11 8.5 10 8 7.5 C9.5 5.5 12 7 12 11Z" fill="currentColor" opacity="0.45"/>
      {/* Hojuelas laterales derechas */}
      <path d="M12 13 C12 13 16 12 17 9 C15.5 7 13 8 12 13Z" fill="currentColor" opacity="0.65"/>
      <path d="M12 10 C12 10 15.5 9 16 6.5 C14.5 4.5 12 6 12 10Z" fill="currentColor" opacity="0.45"/>
      {/* Atadura */}
      <path d="M9.5 18 C10.5 17 13.5 17 14.5 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
