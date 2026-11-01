export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="empty">
      <b>{title}</b>
      {hint && <span>{hint}</span>}
    </div>
  );
}
