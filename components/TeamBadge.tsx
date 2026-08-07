export default function TeamBadge({
  letter,
  color = "#C9A227",
  logoUrl,
  size = 24,
}: {
  letter: string;
  color?: string;
  logoUrl?: string | null;
  size?: number;
}) {
  // Si el equipo tiene logo, se muestra la imagen real; si no, se cae al
  // círculo con la inicial de siempre.
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt=""
        className="rounded-full object-cover shrink-0 bg-[#151417]"
        style={{ width: size, height: size, border: `1px solid ${color}40` }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center font-black shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
        backgroundColor: "#151417",
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {letter}
    </div>
  );
}
