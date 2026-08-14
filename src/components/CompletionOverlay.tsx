import type { Copy } from "../i18n";
import sleepyKitten from "../assets/sleepy-kitten-resting.png";

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
        <div className="completion__nap" aria-hidden="true">
          <span className="completion__spark">✦</span>
          <span className="completion__cushion" />
          <span className="completion__sleeper">
            <img className="nap-journey__kitten" src={sleepyKitten} alt="" />
            <img className="nap-journey__kitten nap-journey__kitten--rump" src={sleepyKitten} alt="" />
            <img className="nap-journey__kitten nap-journey__kitten--tail-tip" src={sleepyKitten} alt="" />
            <img className="nap-journey__kitten nap-journey__kitten--paw" src={sleepyKitten} alt="" />
            <span className="nap-journey__zzz nap-journey__zzz--one">z</span>
            <span className="nap-journey__zzz nap-journey__zzz--two">z</span>
            <span className="nap-journey__zzz nap-journey__zzz--three">z</span>
          </span>
        </div>
        <h2 id="complete-title">{isLast ? copy.finalComplete : copy.complete}</h2>
        <div className="completion__actions">
          {!isLast && <button className="completion__action completion__action--next" aria-label={copy.nextLevel} title={copy.nextLevel} onClick={onNext}>›</button>}
          <button className="completion__action" aria-label={copy.backToLevels} title={copy.backToLevels} onClick={onSelect}>⌂</button>
        </div>
      </div>
    </div>
  );
}
