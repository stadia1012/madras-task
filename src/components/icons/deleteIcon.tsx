export default function DeleteIcon({
  strokeWidth
}: {
  strokeWidth?: number
}) {
  return (
    <svg
      className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth || 1}
    >
      <path d="M18 6l-12 12"></path>
      <path d="M6 6l12 12"></path>
    </svg>
  )
}