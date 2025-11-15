export default function DefaultExtension({
  ext,
  totalExtensions,
  handleCheckbox
}: {
  ext: string,
  totalExtensions: Set<string>,
  handleCheckbox: React.MouseEventHandler<HTMLSpanElement>
}) {
  return (
    <div
      className="group/ext flex items-center justify-between mr-[12px] cursor-pointer"
      data-ext={ext}
      onClick={handleCheckbox}
      onKeyDown={e => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleCheckbox(e as any);
        }
      }}
    >
      <div
        role="checkbox"
        aria-checked={totalExtensions.has(ext)}
        tabIndex={0}
        className={`
          inline-block relative 
          w-[14px] h-[14px] mr-[4px]
          border rounded-[2px]
          text-center
          select-none
          transition
          ${totalExtensions.has(ext)
            ? 'bg-purple-700/95 text-white border-purple-700/95 visible'
            : 'bg-transparent group-hover/ext:bg-purple-200/90 text-transparent group-hover/ext:text-purple-700 border-gray-400 group-hover/ext:border-purple-600'}
        `}
      >
        <span className='block relative top-[2px] text-[9px] font-[400] leading-[100%]'>✔</span>
      </div>
      <span className="">{ext}</span>
    </div>
  )
}