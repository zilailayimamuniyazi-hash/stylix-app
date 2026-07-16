export function SectionHeading({
  eyebrow,
  title,
  align = "left",
  theme = "light",
}: {
  eyebrow?: string;
  title: string;
  align?: "left" | "center";
  theme?: "light" | "dark";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      {eyebrow && (
        <p className="ui-eyebrow mb-4">{eyebrow}</p>
      )}
      <h2 className={`ui-title ${theme === "light" ? "text-[var(--ui-text)]" : ""}`}>
        {title}
      </h2>
    </div>
  );
}
