import {staticFile} from 'remotion';

export const ink='#080A12';
export const cyan='#00C8FF';
export const violet='#8247FF';
export const amber='#FFD77A';
export const paper='#F4EEE3';
export const red='#D96067';
export const display='Impact, "Arial Black", sans-serif';
export const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
export const media=(file:string)=>staticFile(`videos/video-005/${file}`);
export const pictures={
  custody:'imagens/lucia_algemada.jpg',
  prison:'imagens/outra cena da lucia na cadeia__olhando para a camera com um sol atras.webp',
  tension:'imagens/cena_tensa_de_lucia.jpg',
  bike:'imagens/lucia encima de uma moto.jpg',
  city:'imagens/cena da cidade vicity.jpg',
  sea:'imagens/cena do mar do jogo.jpg',
};
