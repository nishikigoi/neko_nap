import catFaceIcon from "../assets/cat-face-icon.png";

interface CatProps {
  sleeping?: boolean;
  conflict?: boolean;
}

export default function Cat({ sleeping = false, conflict = false }: CatProps) {
  return (
    <span className={`cat ${sleeping ? "cat--sleeping" : ""} ${conflict ? "cat--conflict" : ""}`} aria-hidden="true">
      <img className="cat__image" src={catFaceIcon} alt="" />
      {sleeping && <span className="cat__zzz">z</span>}
    </span>
  );
}
