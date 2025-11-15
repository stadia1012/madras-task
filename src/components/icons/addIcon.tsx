export default function AddIcon({
  strokeWidth
}: {
  strokeWidth?: number
}) {
  return (
    <svg
      className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth || 1}
    >
      <path d="M12 5l0 14">
      </path>
      <path d="M5 12l14 0"></path>
    </svg>
  )
}