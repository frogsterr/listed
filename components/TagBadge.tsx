export default function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="bg-cream-hover border border-cream-border text-primary text-[10px] font-medium px-2.5 py-1 rounded-full">
      {tag}
    </span>
  )
}
