export default function TeamBadge({
  letter,
  color = "#C9A227",
}: {
  letter: string;
  color?: string;
}) {
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
      style={{ backgroundColor: "#151417", color, border: `1px solid ${color}40` }}
    >
      {letter}
    </div>
  );
}
