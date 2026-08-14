import type { Copy } from "../i18n";

interface ControlsProps {
  copy: Copy;
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
  onHint: () => void;
}

export default function Controls({ copy, canUndo, onUndo, onReset, onHint }: ControlsProps) {
  return (
    <div className="controls" aria-label={copy.controls}>
      <button className="control-button" aria-label={copy.undo} title={copy.undo} onClick={onUndo} disabled={!canUndo}><span aria-hidden="true">↶</span></button>
      <button className="control-button" aria-label={copy.reset} title={copy.reset} onClick={onReset}><span aria-hidden="true">↻</span></button>
      <button className="control-button control-button--hint" aria-label={copy.hint} title={copy.hint} onClick={onHint}><span aria-hidden="true">✦</span></button>
    </div>
  );
}
