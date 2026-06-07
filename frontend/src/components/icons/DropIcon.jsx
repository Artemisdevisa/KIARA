export default function DropIcon({ size = 24, className = '' }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Gota de agua */}
      <path
        d="M12 3 C12 3 5 11 5 16 C5 19.866 8.134 23 12 23 C15.866 23 19 19.866 19 16 C19 11 12 3 12 3Z"
        fill="currentColor"
      />
      {/* Reflejo interno */}
      <path
        d="M9 17 C9 18.657 10.343 20 12 20"
        stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"
      />
    </svg>
  )
}
