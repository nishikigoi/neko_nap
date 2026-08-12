interface CatProps {
  sleeping?: boolean;
  conflict?: boolean;
}

export default function Cat({ sleeping = false, conflict = false }: CatProps) {
  return (
    <span className={`cat ${sleeping ? "cat--sleeping" : ""} ${conflict ? "cat--conflict" : ""}`} aria-hidden="true">
      <span className="cat__ear cat__ear--left" />
      <span className="cat__ear cat__ear--right" />
      <span className="cat__face">
        <span className="cat__eye cat__eye--left" />
        <span className="cat__eye cat__eye--right" />
        <span className="cat__nose" />
      </span>
      {sleeping && <span className="cat__zzz">z</span>}
    </span>
  );
}
