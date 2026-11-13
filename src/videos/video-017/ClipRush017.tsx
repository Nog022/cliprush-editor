import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  cancelRender,
  continueRender,
  delayRender,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import pages from "./caption-pages.json";

const ORIGINAL = "videos/biblioteca/gta6/videos/video_instagram.mp4";
const SECOND = "videos/video-017/footage/only-in-dade-vice-city-02.mp4";
const COMPARISON = "videos/video-017/footage/comparacao-miami-gta6.mp4";
const GREEN = "#b5f36b";
const INK = "#0b1116";
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

function Footage({
  src,
  start,
  duration,
}: {
  src: string;
  start: number;
  duration: number;
}) {
  const { fps } = useVideoConfig();
  return (
    <OffthreadVideo
      src={staticFile(src)}
      trimBefore={Math.round(start * fps)}
      trimAfter={Math.round(start * fps) + duration}
      muted
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}

function Source({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-safe="source"
      style={{
        position: "absolute",
        left: 80,
        bottom: 122,
        width: 900,
        fontSize: 32,
        lineHeight: 1.25,
        color: "#e7e9e5",
        textShadow: "0 2px 9px #000",
        letterSpacing: 0.2,
      }}
    >
      {children}
    </div>
  );
}

function Heading({
  first,
  second,
  eyebrow,
}: {
  first: string;
  second?: string;
  eyebrow?: string;
}) {
  const frame = useCurrentFrame();
  return (
    <div
      data-safe="heading"
      style={{
        position: "absolute",
        top: 134,
        left: 80,
        width: 900,
        translate: `0 ${interpolate(frame, [0, 8], [12, 0], CLAMP)}px`,
        textShadow: "0 4px 24px #000b",
      }}
    >
      {eyebrow && (
        <div
          style={{
            fontSize: 30,
            color: GREEN,
            letterSpacing: 2,
            marginBottom: 20,
          }}
        >
          {eyebrow}
        </div>
      )}
      <div style={{ fontSize: 104, lineHeight: 0.99, letterSpacing: -4 }}>
        {first}
        {second && (
          <>
            <br />
            <span style={{ color: GREEN }}>{second}</span>
          </>
        )}
      </div>
    </div>
  );
}

function Shot({
  src,
  start,
  duration,
  children,
  detail = false,
}: {
  src: string;
  start: number;
  duration: number;
  children?: React.ReactNode;
  detail?: boolean;
}) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          scale: detail
            ? interpolate(
                frame,
                [0, 9, duration - 12, duration - 1],
                [1, 1.2, 1.2, 1.06],
                CLAMP,
              )
            : 1,
          transformOrigin: "53% 37%",
        }}
      >
        <Footage src={src} start={start} duration={duration} />
        {detail && frame > 22 && frame < duration - 12 && (
          <div
            data-target="roof-reflection"
            style={{
              position: "absolute",
              left: "23%",
              top: "31%",
              width: "60%",
              height: "13%",
              border: `3px solid ${GREEN}`,
              borderRadius: 32,
              opacity: interpolate(
                frame,
                [22, 28, duration - 20, duration - 12],
                [0, 1, 1, 0],
                CLAMP,
              ),
            }}
          />
        )}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, #061016c9 0%, #06101640 24%, transparent 42%, transparent 65%, #061016ce 83%, #061016f5 100%)",
        }}
      />
      {children}
    </AbsoluteFill>
  );
}

function Poll({ final = false }: { final?: boolean }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 160 },
  });
  return (
    <div
      data-safe="poll"
      style={{
        position: "absolute",
        left: 80,
        top: 1230,
        width: 900,
        scale: 0.94 + 0.06 * progress,
        opacity: interpolate(frame, [0, 5], [0, 1], CLAMP),
      }}
    >
      <div style={{ fontSize: 32, letterSpacing: 2, marginBottom: 16 }}>
        {final ? "CONTA AÍ NOS COMENTÁRIOS" : "ESCOLHE ANTES DA REVELAÇÃO"}
      </div>
      <div style={{ display: "flex", gap: 18 }}>
        {[final ? "ACERTEI" : "VIDA REAL", final ? "CAÍ BONITO" : "GTA 6"].map(
          (label, index) => (
            <div
              key={label}
              style={{
                flex: 1,
                border: `2px solid ${index ? GREEN : "#ffffff9c"}`,
                borderRadius: 18,
                padding: "27px 20px",
                background: index ? "#b5f36bed" : "#0b1116e8",
                color: index ? INK : "white",
                textAlign: "center",
                fontSize: 49,
                letterSpacing: -1,
              }}
            >
              {label}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function Note() {
  const frame = useCurrentFrame();
  return (
    <div
      data-safe="note"
      style={{
        position: "absolute",
        left: 80,
        top: 1120,
        width: 840,
        padding: "28px 32px",
        borderLeft: `7px solid ${GREEN}`,
        background: "#0b1116e8",
        rotate: "-2deg",
        translate: `0 ${interpolate(frame, [0, 8], [20, 0], CLAMP)}px`,
      }}
    >
      <div
        style={{
          fontSize: 27,
          color: GREEN,
          letterSpacing: 2,
          marginBottom: 12,
        }}
      >
        NOTA DO EDITOR
      </div>
      <div style={{ fontSize: 54, lineHeight: 1.05 }}>
        O GIMBAL FICOU
        <br />
        EM CASA.
      </div>
    </div>
  );
}

function Rating({ camera = false }: { camera?: boolean }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const numberAt = camera ? 71 : 46;
  const score = camera ? 2 : 10;
  return (
    <>
      <Heading
        first={camera ? "O PULSO..." : "REALISMO"}
        eyebrow="NOTAS DO NARRADOR"
      />
      <div
        data-safe="rating"
        style={{
          position: "absolute",
          left: 80,
          top: 1050,
          display: "flex",
          alignItems: "baseline",
          gap: 18,
          padding: "20px 35px",
          background: "#0b1116ed",
          borderRadius: 22,
        }}
      >
        <div
          style={{
            fontSize: 176,
            lineHeight: 1,
            color: camera ? "#ffbd87" : GREEN,
            scale:
              frame < numberAt
                ? 1
                : spring({
                    frame: frame - numberAt,
                    fps,
                    config: { damping: 15, stiffness: 240 },
                  }),
          }}
        >
          {frame < numberAt ? "?" : score}
        </div>
        <div style={{ fontSize: 56, color: "#bac5c6" }}>/ 10</div>
      </div>
      {camera && (
        <div
          style={{
            position: "absolute",
            top: 1300,
            left: 80,
            fontSize: 38,
            color: "#ffbd87",
          }}
        >
          O CARRO É ESTÁVEL. O CINEGRAFISTA...
        </div>
      )}
    </>
  );
}

function PeopleFocus() {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: "9%",
        top: "35%",
        width: "32%",
        height: "23%",
        border: `4px solid ${GREEN}`,
        borderRadius: "48%",
        opacity: interpolate(frame, [0, 6, 31, 42], [0, 1, 1, 0], CLAMP),
      }}
    />
  );
}

function Publication() {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill
        style={{ background: "#071117a8", backdropFilter: "blur(8px)" }}
      />
      <Heading
        first="ATÉ A ROCKSTAR"
        second="COMPARTILHOU."
        eyebrow="A TRILHA DA PUBLICAÇÃO"
      />
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 500,
          width: 900,
          height: 860,
          display: "flex",
          gap: 35,
          borderTop: "1px solid #ffffff5a",
          paddingTop: 34,
        }}
      >
        <Img
          src={staticFile("videos/video-017/footage/post-original.jpg")}
          style={{
            width: 340,
            height: 605,
            objectFit: "cover",
            borderRadius: 12,
          }}
        />
        <div data-safe="publication" style={{ flex: 1, paddingTop: 40 }}>
          <div style={{ fontSize: 35, color: "#c0cbcb" }}>REEL ORIGINAL</div>
          <div style={{ fontSize: 47, marginTop: 14 }}>@onlyindade</div>
          <div style={{ fontSize: 82, color: GREEN, margin: "32px 0" }}>↓</div>
          <div
            style={{ opacity: interpolate(frame, [70, 82], [0.3, 1], CLAMP) }}
          >
            <div style={{ fontSize: 35, color: "#c0cbcb" }}>
              REPOST NOS STORIES
            </div>
            <div style={{ fontSize: 47, marginTop: 14 }}>@rockstargames</div>
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.3,
                color: "#c0cbcb",
                marginTop: 22,
              }}
            >
              Relatado pela NBC 6<br />
              12 nov. 2026
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Reveal() {
  const frame = useCurrentFrame();
  return <Heading first={frame < 33 ? "SÓ QUE..." : "É VICE CITY."} second={frame >= 84 ? "É GTA 6." : undefined} eyebrow="A REVELAÇÃO" />;
}

function Compare() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Heading first="A MESMA CENA." second="DOIS MUNDOS." />
      <div
        style={{
          position: "absolute",
          top: 415,
          left: 0,
          width: 1080,
          display: "flex",
          fontSize: 42,
          textAlign: "center",
        }}
      >
        <div style={{ width: "50%" }}>MIAMI · VIDA REAL</div>
        <div style={{ width: "50%", color: GREEN }}>VICE CITY · GTA 6</div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 490,
          left: 0,
          width: 1080,
          height: 960,
          overflow: "hidden",
          clipPath: `inset(0 ${interpolate(frame, [0, 10], [9, 0], CLAMP)}% 0 0)`,
        }}
      >
        <Footage src={COMPARISON} start={0} duration={287} />
        <div
          style={{
            position: "absolute",
            left: 538,
            top: 0,
            width: 4,
            height: "100%",
            background: GREEN,
          }}
        />
      </div>
      {frame > 160 && (
        <div
          data-safe="compare-payoff"
          style={{
            position: "absolute",
            left: 80,
            top: 1475,
            fontSize: 34,
            color: GREEN,
          }}
        >
          SIM, A CENA EXISTIU NOS DOIS MUNDOS.
        </div>
      )}
      <Source>Comparação · @NikTek · Miami / Vice City</Source>
    </AbsoluteFill>
  );
}

function Captions() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const page = pages.find((p) => ms >= p.startMs && ms < p.endMs + 60);
  if (!page) return null;
  const highlight = page.words.findIndex((word) =>
    /real|GTA|6|reflexos|pessoas|10|2|Rockstar|Vice|Miami|pegadinha|caiu|acertou/i.test(
      word.text,
    ),
  );
  return (
    <div
      data-safe="caption"
      style={{
        position: "absolute",
        top: 1540,
        left: 80,
        width: 900,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        translate: `0 ${interpolate(frame - (page.startMs / 1000) * fps, [0, 4], [7, 0], CLAMP)}px`,
      }}
    >
      <div
        style={{
          maxWidth: 900,
          fontSize: 65,
          lineHeight: 1.13,
          letterSpacing: -1,
          padding: "18px 26px",
          background: "#091116ee",
          borderRadius: 15,
          textAlign: "center",
          textShadow: "0 2px 8px #000",
        }}
      >
        {page.words.map((word, index) => (
          <React.Fragment key={index}>
            {index ? " " : ""}
            <span style={{ color: index === highlight ? GREEN : "white" }}>
              {word.text.trim()}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export const ClipRush017: React.FC = () => {
  const [handle] = useState(() =>
    delayRender("Carregar fonte local do video-017"),
  );
  useEffect(() => {
    const font = new FontFace(
      "ClipRush017",
      `url("${staticFile("videos/video-017/fonts/Arial-Bold.ttf")}")`,
      { weight: "700" },
    );
    font
      .load()
      .then((loaded) => {
        document.fonts.add(loaded);
        continueRender(handle);
      })
      .catch(cancelRender);
  }, [handle]);
  return (
    <AbsoluteFill
      style={{
        background: INK,
        color: "white",
        fontFamily: "ClipRush017, Arial, sans-serif",
        fontWeight: 700,
      }}
    >
      <Sequence name="Enquete inicial · clipe original" durationInFrames={162}>
        <Shot src={ORIGINAL} start={0} duration={162}>
          <Heading first="VIDA REAL" second="OU GTA 6?" />
          <Sequence
            name="Escolha antes da resposta"
            from={9}
            durationInFrames={153}
          >
            <Poll />
          </Sequence>
          <Source>Vídeo publicado por @onlyindade</Source>
        </Shot>
      </Sequence>
      <Sequence
        name="Carrões e pessoas · continuidade original"
        from={162}
        durationInFrames={93}
      >
        <Shot src={ORIGINAL} start={5.4} duration={93}>
          <Heading first="OLHA ISSO." />
          <Source>Vídeo publicado por @onlyindade</Source>
        </Shot>
      </Sequence>
      <Sequence
        name="Turista · segundo clipe, trecho inédito"
        from={255}
        durationInFrames={171}
      >
        <Shot src={SECOND} start={0} duration={171}>
          <Sequence name="Comentário cômico" from={45} durationInFrames={112}>
            <Note />
          </Sequence>
          <Source>Outro ângulo · @onlyindade</Source>
        </Shot>
      </Sequence>
      <Sequence
        name="Investigação · reflexos no teto"
        from={426}
        durationInFrames={87}
      >
        <Shot src={ORIGINAL} start={10.2} duration={87} detail>
          <Heading first="ESPERA AÍ..." />
          <div
            style={{
              position: "absolute",
              left: 80,
              top: 1120,
              color: GREEN,
              fontSize: 44,
            }}
          >
            OLHA OS REFLEXOS.
          </div>
          <Source>Detalhe ampliado · @onlyindade</Source>
        </Shot>
      </Sequence>
      <Sequence
        name="Investigação · homem de boné em movimento"
        from={513}
        durationInFrames={42}
      >
        <Shot src={ORIGINAL} start={8.5} duration={42}>
          <PeopleFocus />
          <Heading first="E AS PESSOAS?" />
          <Source>Movimento da fonte original · @onlyindade</Source>
        </Shot>
      </Sequence>
      <Sequence
        name="Nota editorial · realismo"
        from={555}
        durationInFrames={65}
      >
        <Shot src={ORIGINAL} start={14.1} duration={65}>
          <Rating />
          <Source>Nota humorística da narração · @onlyindade</Source>
        </Shot>
      </Sequence>
      <Sequence name="Nota editorial · câmera" from={620} durationInFrames={96}>
        <Shot src={ORIGINAL} start={16.267} duration={96}>
          <Rating camera />
          <Source>Movimento original · @onlyindade</Source>
        </Shot>
      </Sequence>
      <Sequence name="Suspense · pegadinha" from={716} durationInFrames={75}>
        <Shot src={SECOND} start={5.7} duration={75}>
          <Heading first="AGORA VEM" second="A PEGADINHA." />
          <Source>Vídeo publicado por @onlyindade</Source>
        </Shot>
      </Sequence>
      <Sequence
        name="Fonte · publicação e repost"
        from={791}
        durationInFrames={136}
      >
        <Shot src={SECOND} start={8.2} duration={136}>
          <Publication />
          <Source>Post original + relato da NBC 6 South Florida</Source>
        </Shot>
      </Sequence>
      <Sequence name="Revelação · Vice City" from={927} durationInFrames={114}>
        <Shot src={SECOND} start={12.733} duration={114}>
          <Reveal />
          <Source>@onlyindade · clipe compartilhado pela Rockstar</Source>
        </Shot>
      </Sequence>
      <Sequence
        name="Prova · Miami e Vice City lado a lado"
        from={1041}
        durationInFrames={287}
      >
        <Compare />
      </Sequence>
      <Sequence
        name="Pergunta final · continuação inédita"
        from={1328}
        durationInFrames={114}
      >
        <Shot src={SECOND} start={16.533} duration={114}>
          <Heading first="ACERTOU" second="OU CAIU?" />
          <Sequence name="Resposta final" from={10} durationInFrames={104}>
            <Poll final />
          </Sequence>
          <Source>GTA 6 · vídeo publicado por @onlyindade</Source>
        </Shot>
      </Sequence>
      <Sequence
        name="Narração original integral e legendas"
        durationInFrames={1442}
      >
        <Audio
          src={staticFile("videos/video-017/audio/narracao.mp3")}
          volume={1}
        />
        <Captions />
      </Sequence>
      <Sequence name="Escolha · efeito original" from={9} durationInFrames={4}>
        <Audio
          src={staticFile("videos/video-017/audio/tick.wav")}
          volume={0.35}
        />
      </Sequence>
      <Sequence
        name="Detalhe · efeito original"
        from={465}
        durationInFrames={4}
      >
        <Audio
          src={staticFile("videos/video-017/audio/tick.wav")}
          volume={0.28}
        />
      </Sequence>
      <Sequence
        name="Nota dez · efeito original"
        from={601}
        durationInFrames={4}
      >
        <Audio
          src={staticFile("videos/video-017/audio/tick.wav")}
          volume={0.32}
        />
      </Sequence>
      <Sequence
        name="Nota dois · efeito original"
        from={691}
        durationInFrames={4}
      >
        <Audio
          src={staticFile("videos/video-017/audio/tick.wav")}
          volume={0.28}
        />
      </Sequence>
      <Sequence
        name="Revelação · efeito original"
        from={960}
        durationInFrames={15}
      >
        <Audio
          src={staticFile("videos/video-017/audio/reveal.wav")}
          volume={0.45}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
