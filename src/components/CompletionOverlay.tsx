interface CompletionOverlayProps {
  isLast: boolean;
  onNext: () => void;
  onSelect: () => void;
}

export default function CompletionOverlay({ isLast, onNext, onSelect }: CompletionOverlayProps) {
  return (
    <div className="completion" role="dialog" aria-modal="true" aria-labelledby="complete-title">
      <div className="completion__card">
        <span className="completion__stars" aria-hidden="true">✦　✧　✦</span>
        <h2 id="complete-title">{isLast ? "Perfect Nap!" : "みんな、すやすや"}</h2>
        <p>安心できる寝床が見つかりました。</p>
        {!isLast && <button className="primary-button" onClick={onNext}>次の部屋へ</button>}
        <button className="text-button" onClick={onSelect}>ステージ選択へ</button>
      </div>
    </div>
  );
}
