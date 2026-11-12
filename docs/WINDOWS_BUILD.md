# Executável Windows

## Abrir

Abra `ClipRush Editor Studio.exe` na pasta `out/desktop-release/win-unpacked`. Mantenha essa pasta inteira junta: o EXE depende dos arquivos adjacentes e de `resources`. Não exige VS Code, Node instalado ou terminal para usar a biblioteca e o preview.

O aplicativo é uma **prévia funcional da Fase 1**, ainda sem assinatura digital e sem atualização automática. O instalador NSIS é uma configuração preparada, não um instalador já validado. A versão foi testada no Windows 10 x64 desta máquina; ainda não há matriz de teste em máquinas limpas.

## Desenvolvimento

```powershell
npm ci
npm run desktop:dev
```

O primeiro comando instala as versões travadas. O download do Electron requer internet na preparação. `desktop:dev` gera os bundles e abre a janela; não há HMR. Após modificar o código, feche a janela e repita o comando. `desktop:start` abre o último build sem reconstruir.

O frontend usa React/TypeScript e esbuild; o processo Electron e preload são bundles próprios. O pacote não carrega o servidor Remotion Studio. Os comandos originais `npm run dev`, `npm run build` e `npm run lint` mantêm suas funções.

## Verificar e empacotar

```powershell
npm run lint
npm run desktop:lint
npm run desktop:typecheck
npm run desktop:test
npm run desktop:build
npm run desktop:e2e
npm run desktop:package
```

`desktop:package` gera `out/desktop-release/win-unpacked`. Feche a versão empacotada antes de reconstruir no mesmo destino. Para preservar uma versão ou manter o aplicativo aberto, use outro destino:

```powershell
npm run desktop:build
.\node_modules\.bin\electron-builder.cmd --dir --win --config electron-builder.yml --config.directories.output=out/desktop-release-v001
```

Para testar o EXE em vez da versão de desenvolvimento:

```powershell
$env:CLIPRUSH_PACKAGED = (Resolve-Path 'out/desktop-release/win-unpacked/ClipRush Editor Studio.exe').Path
npm run desktop:e2e
Remove-Item Env:CLIPRUSH_PACKAGED
```

Os testes utilizam `CLIPRUSH_DATA_HOME` apontando para pastas exclusivas em `out`. Simulam somente o seletor de arquivos nativo; cópia, SQLite, protocolo, decodificação, Player, empacotamento de projeto e reinício são reais. Screenshots e traces ficam em `out/desktop-*`.

## Dependências de mídia

Electron inclui Chromium e Node/SQLite. O preview usa seus decodificadores locais. FFprobe do PATH é opcional para inspeção; há fallback no Chromium. FFmpeg, render worker e ferramentas de renderização dos novos projetos **não estão empacotados nesta fase**. Sua distribuição/licenças, diagnóstico e cancelamento fazem parte da Fase 2/6.

## Instalador e atualização futura

`npm run desktop:installer` está configurado para gerar NSIS com escolha de diretório e atalhos. Ainda exige validação de instalação/desinstalação, ícone final, assinatura de código, teste em máquina limpa e revisão das dependências antes de uma distribuição pública. Não há auto-update; uma futura atualização deverá preservar o diretório de dados e executar migrações versionadas.
