import { createPortal } from 'react-dom';

const TAGS = [
  { text: 'CORPS LIE', font: 'font-spray', style: 'top-[7%] left-[1%] text-[7vw] -rotate-6' },
  { text: 'Johnson mente', font: 'font-tag', style: 'top-[36%] -left-[1%] text-[4.5vw] rotate-3' },
  { text: 'SEM SIN', font: 'font-spray', style: 'bottom-[9%] left-[3%] text-[6vw] rotate-[-4deg]' },
  { text: 'vigie a retaguarda', font: 'font-tag', style: 'top-[18%] right-[1%] text-[3.6vw] rotate-6' },
  { text: 'NO DRAGONS', font: 'font-spray', style: 'top-[58%] right-[0%] text-[5.5vw] -rotate-3' },
  { text: 'Seattle queima', font: 'font-tag', style: 'bottom-[4%] right-[4%] text-[4.2vw] -rotate-2' },
];

const DRIPS = [
  { left: '9%', top: '17%', height: '15vh' },
  { left: '14%', top: '16%', height: '7vh' },
  { left: '6%', top: '91%', height: '6vh' },
  { left: '93%', top: '66%', height: '18vh' },
  { left: '88%', top: '67%', height: '9vh' },
];

function Crosshair() {
  return (
    <svg viewBox="0 0 100 100" className="absolute top-[64%] left-[10%] h-[22vh] w-[22vh] -rotate-12" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="7" strokeDasharray="30 6">
        <circle cx="50" cy="50" r="36" />
      </g>
      <path d="M50 0v34M50 66v34M0 50h34M66 50h34" stroke="currentColor" strokeWidth="7" />
    </svg>
  );
}

export function GraffitiWall() {
  return createPortal(
    <div className="wall no-print" aria-hidden="true">
      <div className="wall-spray left-[-6%] top-[2%] h-[46vh] w-[46vh]" />
      <div className="wall-spray right-[-8%] top-[46%] h-[60vh] w-[60vh]" />
      {TAGS.map((tag) => (
        <span key={tag.text} className={`wall-tag ${tag.font} ${tag.style}`}>{tag.text}</span>
      ))}
      {DRIPS.map((drip) => (
        <span key={drip.left + drip.top} className="wall-drip" style={drip} />
      ))}
      <Crosshair />
    </div>,
    document.body,
  );
}
