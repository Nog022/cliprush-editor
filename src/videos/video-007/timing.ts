export const AUDIO_SECONDS = 39.706063;
export const FPS = 30;
export const DURATION = Math.ceil(AUDIO_SECONDS * FPS);
export const asset = (file: string) => `videos/video-007/${file}`;
export const portrait = (person: "Jason" | "Brian", n: number) =>
  asset(
    `imagens/${person === "Jason" ? "Jason_Duval" : "Brian_Heder"}_0${n}.jpg`,
  );
