import type { Copy } from "../i18n";

interface CompletionOverlayProps {
  isLast: boolean;
  onNext: () => void;
  onSelect: () => void;
  copy: Copy;
}

export default function CompletionOverlay({ isLast, onNext, onSelect, copy }: CompletionOverlayProps) {
  return (
    <div className="completion" role="dialog" aria-modal="true" aria-labelledby="complete-title">
      <div className="completion__card">
        <span className="completion__stars" aria-hidden="true">✦　✧　✦</span>
        <h2 id="complete-title">{isLast ? "Perfect Nap!" : copy.complete}</h2>
        <div className="completion__actions">
          {!isLast && <button className="completion__action completion__action--next" aria-label={copy.nextLevel} title={copy.nextLevel} onClick={onNext}>›</button>}
          <button className="completion__action" aria-label={copy.backToLevels} title={copy.backToLevels} onClick={onSelect}>⌂</button>
        </div>
      </div>
    </div>
  );
}
