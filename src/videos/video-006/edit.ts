export type Visual = {
  file: string;
  game: 'GTA 5' | 'GTA 6';
  kind: 'image' | 'video';
  offset?: number;
  position?: string;
};
export type Shot = {
  id: string;
  from: number;
  to: number;
  chapter: string;
  title: string;
  layout: 'split' | 'hero' | 'phone' | 'reveal';
  a: Visual;
  b?: Visual;
  motion: 'push' | 'pull' | 'left' | 'right' | 'steady';
  entry: 'cut' | 'wipe' | 'lift';
  intent: string;
  number?: string;
};
const beach5: Visual = {file:'imagens/praia_gta5.jfif',game:'GTA 5',kind:'image'};
const beach6: Visual = {file:'imagens/praia_gta6.jfif',game:'GTA 6',kind:'image'};
const traffic5: Visual = {file:'imagens/transito_gta5.jfif',game:'GTA 5',kind:'image'};
const traffic6: Visual = {file:'imagens/transito_gta6.jfif',game:'GTA 6',kind:'image'};
const npc5: Visual = {file:'imagens/npcs_gta5.jfif',game:'GTA 5',kind:'image',position:'50% 45%'};
const npc6: Visual = {file:'imagens/npcs_gta6.jfif',game:'GTA 6',kind:'image'};
const clip = (name:string,offset=0):Visual => ({file:`footage/${name}.mp4`,game:'GTA 6',kind:'video',offset});
// Frames follow the voice, including its pauses. Source ranges are in selects.json.
export const shots: Shot[] = [
  {id:'hook',from:0,to:67,chapter:'GTA 5 × GTA 6',title:'EVOLUIU MESMO?',layout:'split',a:beach5,b:beach6,motion:'pull',entry:'cut',intent:'Comparação imediata, sem vinheta.'},
  {id:'beauty',from:67,to:121,chapter:'GTA 5 × GTA 6',title:'SÓ MAIS BONITO?',layout:'hero',a:beach6,motion:'left',entry:'wipe',intent:'Detalhes de pessoas no mesmo cenário.'},
  {id:'promise',from:121,to:198,chapter:'A ÚLTIMA COMPARAÇÃO',title:'MUDA TUDO.',layout:'hero',a:clip('city'),motion:'steady',entry:'cut',intent:'Plano urbano em movimento sem revelar números.'},
  {id:'streets',from:198,to:246,chapter:'01 / AS RUAS',title:'LOS SANTOS / VICE CITY',layout:'split',a:traffic5,b:traffic6,motion:'right',entry:'cut',intent:'Dois ambientes urbanos claramente identificados.'},
  {id:'los-santos',from:246,to:287,chapter:'01 / AS RUAS',title:'LOS SANTOS',layout:'hero',a:traffic5,motion:'pull',entry:'cut',intent:'GTA 5 durante a menção a Los Santos.'},
  {id:'vice-traffic',from:287,to:340,chapter:'01 / AS RUAS',title:'VICE CITY EM MOVIMENTO',layout:'hero',a:clip('traffic'),motion:'steady',entry:'wipe',intent:'Fluxo real de veículos e prédios no Trailer 2.'},
  {id:'beach-intro',from:340,to:395,chapter:'02 / AS PRAIAS',title:'VIDA À BEIRA-MAR',layout:'hero',a:clip('beach-gym'),motion:'steady',entry:'cut',intent:'Atividade na praia introduz a categoria.'},
  {id:'vespucci',from:395,to:445,chapter:'02 / AS PRAIAS',title:'VESPUCCI BEACH',layout:'hero',a:beach5,motion:'right',entry:'cut',intent:'Preservar pedestres de GTA 5 na afirmação de que já tinha vida.'},
  {id:'crowd',from:445,to:490,chapter:'02 / AS PRAIAS',title:'OLHA A MULTIDÃO.',layout:'hero',a:beach6,motion:'pull',entry:'wipe',intent:'Abrir o enquadramento para revelar a densidade visível.'},
  {id:'beach-compare',from:490,to:544,chapter:'02 / AS PRAIAS',title:'O AMBIENTE GANHA VIDA',layout:'split',a:beach5,b:clip('beach-gym',1.84),motion:'steady',entry:'cut',intent:'Comparar ambientação; não quantificar população.'},
  {id:'night',from:544,to:631,chapter:'03 / A NOITE',title:'CARROS. LUZES. REFLEXOS.',layout:'split',a:traffic5,b:traffic6,motion:'left',entry:'cut',intent:'Comparação noturna com enquadramentos próximos.'},
  {id:'night-motion',from:631,to:690,chapter:'03 / A NOITE',title:'A RUA NÃO PARA.',layout:'hero',a:clip('street'),motion:'steady',entry:'lift',intent:'Movimento de câmera, carros e luzes reais.'},
  {id:'phones',from:690,to:744,chapter:'04 / OS CELULARES',title:'UM MUNDO CONECTADO',layout:'phone',a:npc6,motion:'push',entry:'cut',intent:'Telefone editorial ilustrativo, sem imitar interface oficial.'},
  {id:'social-club',from:744,to:792,chapter:'04 / OS CELULARES',title:'VÍDEOS E REDES SOCIAIS',layout:'phone',a:clip('club'),motion:'steady',entry:'cut',intent:'Representação editorial com cena de vida noturna.'},
  {id:'social-street',from:792,to:857,chapter:'04 / OS CELULARES',title:'POR TODA PARTE',layout:'phone',a:clip('promenade'),motion:'steady',entry:'cut',intent:'Situação urbana; manter rótulo de montagem ilustrativa.'},
  {id:'suspense',from:857,to:957,chapter:'A MAIOR EVOLUÇÃO',title:'ALÉM DOS GRÁFICOS.',layout:'hero',a:clip('gesture'),motion:'steady',entry:'cut',intent:'Plano longo de expressão e gesto, reduzindo o ritmo antes dos números.'},
  {id:'npc-five',from:957,to:1007,chapter:'05 / ANIMAÇÕES',title:'OS PERSONAGENS',layout:'hero',a:npc5,motion:'pull',entry:'cut',intent:'Base visual GTA 5 antes da contagem.'},
  {id:'number-five',from:1007,to:1093,chapter:'05 / ANIMAÇÕES',title:'GTA 5',layout:'hero',a:npc5,motion:'push',entry:'lift',number:'≈ 55 MIL',intent:'Contagem aparece somente ao ser narrada.'},
  {id:'question-six',from:1093,to:1145,chapter:'05 / ANIMAÇÕES',title:'E NO GTA 6?',layout:'hero',a:clip('bar'),motion:'steady',entry:'cut',intent:'Movimento natural de várias pessoas; segurar a revelação.'},
  {id:'reveal',from:1145,to:1191,chapter:'05 / ANIMAÇÕES',title:'UM SALTO DE ESCALA',layout:'reveal',a:npc5,b:clip('bar',1.74),motion:'steady',entry:'wipe',number:'≈ 600 MIL',intent:'Confrontar os números e a cena viva, com fonte legível.'},
  {id:'living-city',from:1191,to:1242,chapter:'VICE CITY',title:'UMA CIDADE DE VERDADE?',layout:'hero',a:clip('bar',3.3),motion:'steady',entry:'cut',intent:'Continuidade da interação no bar durante a pergunta.'},
  {id:'closing',from:1242,to:1305,chapter:'VICE CITY',title:'O QUE VOCÊ ACHA?',layout:'hero',a:clip('water'),motion:'steady',entry:'cut',intent:'Plano aberto em movimento e CTA curto, sem créditos.'},
];
