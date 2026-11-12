import {staticFile} from 'remotion';

export const color = {
  ink: '#080A12', cyan: '#00C8FF', violet: '#8247FF', navy: '#111B3A',
  white: '#FFFFFF', yellow: '#FFE34D', pink: '#FF63BD', orange: '#FF985C',
  green: '#9DFF67', red: '#FF6679', muted: '#A5AEC5',
};
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = {damping: 17, stiffness: 150, mass: .8};
export const display = 'Impact, "Arial Black", sans-serif';
export const asset = (path: string) => staticFile(`videos/video-004/${path}`);
export const images = {
  hero: 'imagens/lucia e jason.jfif',
  duo: 'imagens/lucia e jason em outra posição.jfif',
  street: 'imagens/ruas do gta.jfif',
  cover: 'imagens/capa do jogo.jfif',
  consoles: 'imagens/consoles.jfif',
};
// ceil(39.967313 * 30) = 1200. No narration trim or playback-rate change.
export const metadata004 = {durationSeconds: 39.967313, durationInFrames: 1200};
