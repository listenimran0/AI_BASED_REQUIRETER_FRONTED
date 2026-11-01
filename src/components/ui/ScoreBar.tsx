export function ScoreBar({ score }: { score?: number | null }) {
  if (score == null) return <span className="muted small">pending</span>;
  const tone = score >= 75 ? 'high' : score >= 50 ? 'mid' : 'low';
  return (
    <div className="score">
      <div className="score-track">
        <div className={`score-fill ${tone}`} style={{ width: `${score}%` }} />
      </div>
      <b>{score}</b>
    </div>
  );
}
