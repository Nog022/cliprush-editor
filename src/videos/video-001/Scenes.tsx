import {
  AbsoluteFill,
  Interactive,
  Sequence,
  Track,
  useVideoConfig,
} from "remotion";
import {
  ChoiceGraphic,
  Headline,
  PageCounter,
  ReportGraphic,
  RushCamera,
  SupportImage,
} from "./Visuals";

export const Opening = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      <RushCamera sourceStart={1.4} punchAt={7.75} />
      <AbsoluteFill style={{ zIndex: 3 }}>
        <Track name="Gancho editorial">
          <Sequence
            name="GTA VI · novos detalhes"
            from={1.4 * fps}
            durationInFrames={6.3 * fps}
            layout="none"
          >
            <Headline kicker="NO RADAR" size={110}>
              GTA VI
              <br />
              <span style={{ color: "#47eaff" }}>
                NOVOS
                <br />
                DETALHES?
              </span>
            </Headline>
          </Sequence>
          <Sequence
            name="Destaque · sem vazamento"
            from={7.7 * fps}
            durationInFrames={1.6 * fps}
            layout="none"
          >
            <Headline kicker="DESSA VEZ…" size={108}>
              NÃO É<br />
              <span style={{ color: "#bd9cff" }}>VAZAMENTO.</span>
            </Headline>
          </Sequence>
        </Track>
      </AbsoluteFill>
    </>
  );
};

export const EdgeStory = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      <RushCamera sourceStart={11} pipAt={11} />
      <AbsoluteFill style={{ zIndex: 3 }}>
        <Sequence
          name="Capa EDGE · imagem fornecida"
          from={11 * fps}
          durationInFrames={7.3 * fps}
          layout="none"
        >
          <Headline kicker="REVISTA EDGE" size={82}>
            EDIÇÃO ESPECIAL
          </Headline>
          <SupportImage
            asset="poster_do_gta.png"
            top={455}
            height={745}
            contain
          />
        </Sequence>
        <Sequence
          name="16 páginas · contagem"
          from={14.6 * fps}
          durationInFrames={3.7 * fps}
          layout="none"
        >
          <PageCounter />
        </Sequence>
      </AbsoluteFill>
    </>
  );
};

export const RockstarStory = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      <RushCamera sourceStart={20.2} pipAt={21.6} />
      <AbsoluteFill style={{ zIndex: 3 }}>
        <Sequence
          name="Visita à Rockstar · Escócia"
          from={21.6 * fps}
          durationInFrames={6.5 * fps}
          layout="none"
        >
          <Headline kicker="BASTIDORES DO JOGO" size={90}>
            DIRETO DA
            <br />
            <span style={{ color: "#bd9cff" }}>ROCKSTAR</span>
          </Headline>
          <SupportImage asset="imagem_da_rockstar.jpg" top={565} height={620} />
          <Interactive.Div
            name="Localização · Escócia"
            style={{
              position: "absolute",
              left: 90,
              top: 1220,
              color: "#47eaff",
              fontSize: 44,
              fontWeight: 800,
              letterSpacing: 3,
              padding: "18px 24px",
              backgroundColor: "#11172c",
              border: "1px solid #47eaff66",
              borderRadius: 12,
            }}
          >
            ESCÓCIA
          </Interactive.Div>
        </Sequence>
      </AbsoluteFill>
    </>
  );
};

export const ReportStory = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      <RushCamera sourceStart={31.3} pipAt={31.3} />
      <AbsoluteFill style={{ zIndex: 3 }}>
        <Track name="Conteúdo da reportagem">
          <Sequence
            name="Entrevistas e imagens · motion graphic"
            from={31.3 * fps}
            durationInFrames={4.3 * fps}
            layout="none"
          >
            <Headline kicker="O QUE VEM AÍ" size={90}>
              POR DENTRO
              <br />
              <span style={{ color: "#bd9cff" }}>DE GTA VI</span>
            </Headline>
            <ReportGraphic />
          </Sequence>
          <Sequence
            name="GamesRadar · acesso gratuito"
            from={35.6 * fps}
            durationInFrames={4.3 * fps}
            layout="none"
          >
            <Headline kicker="TAMBÉM NA WEB" size={94}>
              CONTEÚDO
              <br />
              <span style={{ color: "#47eaff" }}>GRATUITO</span>
            </Headline>
            <SupportImage
              asset="logo_da_gamesradar.jpg"
              top={650}
              height={470}
              contain
            />
          </Sequence>
        </Track>
      </AbsoluteFill>
    </>
  );
};

export const Closing = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      <RushCamera sourceStart={43.2} punchAt={46.5} pipAt={48.8} />
      <AbsoluteFill style={{ zIndex: 3 }}>
        <Track name="Pergunta final">
          <Sequence
            name="Mecânicas · ainda sem confirmação"
            from={43.2 * fps}
            durationInFrames={3.3 * fps}
            layout="none"
          >
            <Headline kicker="NOVAS MECÂNICAS?" size={91}>
              AINDA SEM
              <br />
              <span style={{ color: "#bd9cff" }}>CONFIRMAÇÃO.</span>
            </Headline>
          </Sequence>
          <Sequence
            name="Convite ao comentário"
            from={46.5 * fps}
            durationInFrames={2.3 * fps}
            layout="none"
          >
            <Headline kicker="AGORA É COM VOCÊ" size={98}>
              O QUE VOCÊ
              <br />
              <span style={{ color: "#47eaff" }}>QUER VER?</span>
            </Headline>
          </Sequence>
          <Sequence
            name="Mapa, gameplay ou história"
            from={48.8 * fps}
            durationInFrames={6.6 * fps}
            layout="none"
          >
            <Headline kicker="CONTA PRA GENTE" size={92}>
              QUAL É A SUA
              <br />
              <span style={{ color: "#47eaff" }}>PRIORIDADE?</span>
            </Headline>
            <ChoiceGraphic />
          </Sequence>
        </Track>
      </AbsoluteFill>
    </>
  );
};
