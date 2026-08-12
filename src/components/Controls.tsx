interface ControlsProps {
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
  onHint: () => void;
}

export default function Controls({ canUndo, onUndo, onReset, onHint }: ControlsProps) {
  return (
    <div className="controls" aria-label="ゲーム操作">
      <button className="control-button" onClick={onUndo} disabled={!canUndo}><span aria-hidden="true">↶</span> 一手戻す</button>
      <button className="control-button" onClick={onReset}><span aria-hidden="true">↻</span> リセット</button>
      <button className="control-button control-button--hint" onClick={onHint}><span aria-hidden="true">✦</span> ヒント</button>
    </div>
  );
}
