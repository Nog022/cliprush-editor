import {useMemo} from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {LIVE_LAYOUT} from '../shared/live-preset';

const roundedHole = ({x, y, width: w, height: h}: typeof LIVE_LAYOUT.webcam) => {
  const r = 50;
  return `M${x+r} ${y}H${x+w-r}Q${x+w} ${y} ${x+w} ${y+r}V${y+h-r}Q${x+w} ${y+h} ${x+w-r} ${y+h}H${x+r}Q${x} ${y+h} ${x} ${y+h-r}V${y+r}Q${x} ${y} ${x+r} ${y}Z`;
};
// Alpha holes remove the black placeholders while leaving all reference artwork intact.
const mask = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><path fill="white" fill-rule="evenodd" d="M0 0H1080V1920H0Z ${roundedHole(LIVE_LAYOUT.webcam)} ${roundedHole(LIVE_LAYOUT.gameplay)}"/></svg>`)}")`;

/** Measure the same explicit Arial bold face used for painting, in both browser renderers. */
export function fitLiveCaption(text: string) {
  const context = document.createElement('canvas').getContext('2d');
  if (!context) throw new Error('Medição de legenda indisponível.');
  for (let size = 56; size >= 8; size--) {
    context.font = `700 ${size}px Arial`;
    const lines: string[] = [];
    // Reflow user whitespace as well, so even many line breaks stay inside the fixed box.
    for (const paragraph of [text.replace(/\s+/g, ' ').trim()]) {
      let line = '';
      for (const char of paragraph) {
        if (context.measureText(line + char).width > LIVE_LAYOUT.caption.width && line) {
          const space = line.lastIndexOf(' ');
          if (space > 0) { lines.push(line.slice(0, space)); line = line.slice(space + 1); }
          else {lines.push(line); line = '';}
        }
        line += char;
      }
      lines.push(line);
    }
    if (lines.length * size * 1.1 <= LIVE_LAYOUT.caption.height) return {size, text: lines.join('\n')};
  }
  throw new Error('Legenda excede a área disponível.');
}

export function LiveOverlay({caption}: {caption: string}) {
  const fitted = useMemo(() => fitLiveCaption(caption), [caption]);
  const box = LIVE_LAYOUT.caption;
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    {/* build-desktop ships this at the same root URL in the UI and render bundles. */}
    {/* eslint-disable-next-line @remotion/no-string-assets -- Shared desktop bundle asset, outside Remotion's public/ base. */}
    <Img src="/templates/corte-live/template.png" style={{width: 1080, height: 1920, maskImage: mask, maskSize: '100% 100%'}} />
    <div data-testid="live-caption" style={{position: 'absolute', left: box.x, top: box.y,
      width: box.width, height: box.height, display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', whiteSpace: 'pre', color: 'white', fontFamily: 'Arial, sans-serif',
      fontWeight: 700, fontSize: fitted.size, lineHeight: 1.1}}>{fitted.text}</div>
  </AbsoluteFill>;
}
