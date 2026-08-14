import type { Copy } from "../i18n";
import catFaceIcon from "../assets/cat-face-icon.png";
import sleepyKitten from "../assets/sleepy-kitten-resting.png";

interface HomeScreenProps {
  onStart: () => void;
  copy: Copy;
}

export default function HomeScreen({ onStart, copy }: HomeScreenProps) {
  return (
    <main className="select-screen">
      <div className="brand brand--large"><span>Neko</span> Nap <span className="brand__moon">☾</span></div>
      <p className="select-screen__lead">{copy.tagline}</p>
      <div className="nap-journey" aria-hidden="true">
        <span className="nap-journey__cloud nap-journey__cloud--left" />
        <span className="nap-journey__cloud nap-journey__cloud--right" />
        <span className="nap-journey__spark nap-journey__spark--one">✦</span>
        <span className="nap-journey__spark nap-journey__spark--two">✧</span>
        <span className="nap-journey__hill nap-journey__hill--back" />
        <span className="nap-journey__hill nap-journey__hill--front" />
        <span className="nap-journey__cushion" />
        <span className="nap-journey__sleeper">
          <img className="nap-journey__kitten" src={sleepyKitten} alt="" />
          <img className="nap-journey__kitten nap-journey__kitten--rump" src={sleepyKitten} alt="" />
          <img className="nap-journey__kitten nap-journey__kitten--tail-tip" src={sleepyKitten} alt="" />
          <img className="nap-journey__kitten nap-journey__kitten--paw" src={sleepyKitten} alt="" />
          <span className="nap-journey__zzz nap-journey__zzz--visible">z</span>
        </span>
      </div>
      <section className="rules" aria-labelledby="rules-heading">
        <h1 id="rules-heading">{copy.rulesHeading}</h1>
        <p><span className="rules__icons" aria-hidden="true"><img src={catFaceIcon} alt="" /> ↔ <img src={catFaceIcon} alt="" /></span>{copy.ruleSight}</p>
        <p><span className="rules__icons" aria-hidden="true"><img src={catFaceIcon} alt="" /> 🌿 <img src={catFaceIcon} alt="" /></span>{copy.ruleFurniture}</p>
      </section>
      <button className="start-button" aria-label={copy.start} title={copy.start} onClick={onStart}>▶</button>
    </main>
  );
}
