export default function PlantIcon({ size = 24, className = '' }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Tallo principal */}
      <path d="M12 22V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      {/* Hoja derecha — crece hacia arriba-derecha */}
      <path
        d="M12 16 C16 14 19 10 17 6 C14 5 11 8 12 16Z"
        fill="currentColor"
      />
      {/* Hoja izquierda — más pequeña, opaca */}
      <path
        d="M12 13 C8 11 6 8 8 5 C11 4 13 7 12 13Z"
        fill="currentColor" opacity="0.6"
      />
      {/* Línea de suelo */}
      <path
        d="M8 22 C8 22 10 21 12 21 C14 21 16 22 16 22"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"
      />
    </svg>
  )
}
