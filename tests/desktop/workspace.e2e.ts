import {
  test,
  expect,
  _electron as electron,
  type ElectronApplication,
} from "@playwright/test";
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import type { DesktopAPI } from "../../shared/model";

const directory = path.resolve("out/desktop-e2e-workspace");
const launch = async (dataDirectory = directory, withoutFFprobe = false) => {
  const env: Record<string, string | undefined> = {
    ...process.env,
    CLIPRUSH_DATA_HOME: dataDirectory,
  };
  if (withoutFFprobe) {
    for (const key of Object.keys(env))
      if (key.toLowerCase() === "path") delete env[key];
    env.PATH = path.join(process.env.SystemRoot ?? "C:/Windows", "System32");
  }
  delete env.ELECTRON_RUN_AS_NODE;
  return electron.launch({
    args: process.env.CLIPRUSH_PACKAGED ? [] : ["."],
    ...(process.env.CLIPRUSH_PACKAGED
      ? {
          executablePath: path.resolve(process.env.CLIPRUSH_PACKAGED),
          cwd: dataDirectory,
        }
      : {}),
    env: Object.fromEntries(
      Object.entries(env).filter(
        (entry): entry is [string, string] => entry[1] !== undefined,
      ),
    ),
  });
};
async function selectFiles(app: ElectronApplication, filePaths: string[]) {
  await app.evaluate(({ dialog }, files) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: files });
  }, filePaths);
}
test("real desktop workflow: legacy previews, native import, save, package and restart", async () => {
  // This directory is dedicated to this test and resolved inside out/.
  await rm(directory, { recursive: true, force: true });
  await mkdir(path.join(directory, "fixtures"), { recursive: true });
  const image = path.join(directory, "fixtures", "imagem com espaço.jpg");
  await copyFile("public/videos/video-005/imagens/lucia_algemada.jpg", image);
  const audio = path.join(directory, "fixtures", "narração.wav");
  const wav = Buffer.alloc(44 + 16000 * 2);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(16000, 24);
  wav.writeUInt32LE(32000, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(wav.length - 44, 40);
  await writeFile(audio, wav);
  let app = await launch();
  try {
    let page = await app.firstWindow();
    const failures: string[] = [];
    page.on("pageerror", (error) => failures.push(error.message));
    await expect(
      page.getByRole("heading", { name: "Suas histórias começam aqui." }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: "Abrir ClipRushAI002NarradoV2",
        exact: true,
      }),
    ).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator(".project-card img")
          .evaluateAll((images) =>
            images.every(
              (img) =>
                (img as HTMLImageElement).complete &&
                (img as HTMLImageElement).naturalWidth > 0,
            ),
          ),
      )
      .toBeTruthy();
    await page.screenshot({
      path: "out/desktop-dashboard.png",
      fullPage: true,
    });
    // Every authored registration loads, including dynamic audio metadata.
    const ids = [
      "MyComp",
      "ClipRushAI002",
      "ClipRushAI002Narrado",
      "ClipRushAI002NarradoV2",
      "ClipRushVideo001",
      "ClipRushVideo003",
      "ClipRushVideo004",
      "ClipRushVideo005",
    ];
    for (const id of ids) {
      await page
        .getByRole("button", { name: "Meus projetos", exact: true })
        .click();
      await page
        .getByRole("button", { name: `Abrir ${id}`, exact: true })
        .click();
      await expect(page.getByTestId("player-stage")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Próximo quadro" }),
      ).toBeVisible({ timeout: 20000 });
      await page.getByRole("button", { name: "Próximo quadro" }).click();
      await expect(page.locator(".transport")).toContainText("quadro 1");
      await page
        .getByLabel("Ir para quadro")
        .fill(id === "MyComp" ? "30" : "120");
      await expect(page.locator(".transport")).toContainText(
        id === "MyComp" ? "quadro 30" : "quadro 120",
      );
      await expect
        .poll(() =>
          page
            .locator('[data-testid="player-stage"] img')
            .evaluateAll((images) =>
              images.every(
                (img) =>
                  (img as HTMLImageElement).complete &&
                  (img as HTMLImageElement).naturalWidth > 0,
              ),
            ),
        )
        .toBeTruthy();
      await expect(page.locator(".error")).toHaveCount(0);
    }
    await page.screenshot({
      path: "out/desktop-legacy-preview.png",
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Novo projeto", exact: false })
      .first()
      .click();
    await page.getByLabel("Nome do projeto").fill("Vídeo de teste persistente");
    await page
      .getByRole("button", { name: "Criar projeto", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Vídeo de teste persistente" }),
    ).toBeVisible();
    await selectFiles(app, [image, audio]);
    await page
      .getByRole("button", { name: "Importar mídia", exact: false })
      .click();
    await expect(page.getByRole("status")).toContainText(
      "2 arquivo(s) importado(s)",
      { timeout: 45000 },
    );
    await page
      .getByRole("button", { name: "Adicionar", exact: true })
      .nth(0)
      .click();
    await page
      .getByRole("button", { name: "Adicionar", exact: true })
      .nth(1)
      .click();
    await page
      .getByRole("button", { name: "Salvar projeto", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("Projeto salvo");
    await expect(page.locator(".clip-row")).toHaveCount(2);
    await page.screenshot({ path: "out/desktop-editor.png", fullPage: true });
    const state = await page.evaluate(() =>
      (window as unknown as { cliprush: DesktopAPI }).cliprush.workspace(),
    );
    const project = state.projects[0];
    expect(project.assets).toHaveLength(2);
    expect(project.clips).toHaveLength(2);
    expect(project.clips[0].durationInFrames).toBe(150);
    expect(project.assets[0].path).not.toContain("fixtures");
    expect(project.assets[0].hash).toMatch(/^[a-f0-9]{64}$/);
    // Imported image is decoded from the restricted protocol, not a fixture URL.
    await expect
      .poll(() =>
        page
          .locator('[data-testid="player-stage"] img')
          .evaluateAll((images) =>
            images.some((img) => (img as HTMLImageElement).naturalWidth > 0),
          ),
      )
      .toBeTruthy();
    await page
      .getByRole("button", { name: "Importar mídia", exact: false })
      .click();
    await expect(page.getByRole("status")).toContainText("2 duplicado(s)");
    const packageFolder = path.join(directory, "packages");
    await mkdir(packageFolder, { recursive: true });
    await selectFiles(app, [packageFolder]);
    await page.getByRole("button", { name: "Empacotar projeto" }).click();
    await expect(page.getByRole("status")).toContainText("Pacote salvo");
    const folder = (await readdir(packageFolder))[0];
    const manifestPath = path.join(
      packageFolder,
      folder,
      "project.cliprush.json",
    );
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    expect(
      manifest.assets.every((asset: { path: string }) =>
        asset.path.startsWith("media/"),
      ),
    ).toBeTruthy();
    await selectFiles(app, [manifestPath]);
    await page
      .getByRole("button", { name: "Importar projeto", exact: false })
      .click();
    await expect(page.locator(".clip-row")).toHaveCount(2);
    await expect
      .poll(
        async () =>
          (await page.evaluate(() => window.cliprush.workspace())).projects
            .length,
      )
      .toBe(2);
    // Range requests and traversal prevention use the real protocol.
    const result = await page.evaluate(
      async ({ projectId, assetId }) => {
        const response = await fetch(
          `cliprush://app/media/${projectId}/${assetId}`,
          { headers: { Range: "bytes=0-9" } },
        );
        const traversal = await fetch("cliprush://app/%2e%2e%2fpackage.json");
        return {
          status: response.status,
          bytes: (await response.arrayBuffer()).byteLength,
          traversal: traversal.status,
          node: typeof (window as unknown as { require?: unknown }).require,
        };
      },
      { projectId: project.id, assetId: project.assets[0].id },
    );
    expect(result).toEqual({
      status: 206,
      bytes: 10,
      traversal: 404,
      node: "undefined",
    });
    expect(failures).toEqual([]);
    await app.close();
    app = await launch();
    page = await app.firstWindow();
    await expect(
      page.getByRole("heading", { name: "Suas histórias começam aqui." }),
    ).toBeVisible();
    const restored = await page.evaluate(() => window.cliprush.workspace());
    expect(restored.projects).toHaveLength(2);
    expect(
      restored.projects.every(
        (p) => p.clips.length === 2 && p.assets.length === 2,
      ),
    ).toBeTruthy();
    await page
      .getByRole("button", {
        name: "Abrir Vídeo de teste persistente",
        exact: true,
      })
      .first()
      .click();
    await expect(page.locator(".clip-row")).toHaveCount(2);
  } finally {
    await app.close();
  }
});

test("offline metadata, missing references, archive and portable custom channels", async () => {
  const dataDirectory = path.resolve("out/desktop-e2e-recovery");
  await rm(dataDirectory, { recursive: true, force: true });
  await mkdir(dataDirectory, { recursive: true });
  const image = path.join(dataDirectory, "original.jpg");
  const moved = path.join(dataDirectory, "relocated.jpg");
  const audio = path.join(dataDirectory, "voice.mp3");
  await copyFile("public/videos/video-005/imagens/lucia_algemada.jpg", image);
  await copyFile("public/videos/video-002/narracao.mp3", audio);
  const app = await launch(dataDirectory, true);
  try {
    const page = await app.firstWindow();
    await page
      .getByRole("button", { name: "Configurações", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Novo canal", exact: false })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("Nome", { exact: true })
      .fill("Animation independent");
    await page
      .getByRole("button", { name: "Criar canal", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page
      .getByRole("button", { name: "Novo projeto", exact: false })
      .click();
    await page.getByLabel("Nome do projeto").fill("Offline reference test");
    await expect(
      page.getByRole("dialog").getByLabel("Idioma", { exact: true }),
    ).toHaveValue("en");
    await page
      .getByRole("button", { name: "Criar projeto", exact: true })
      .click();
    await page.getByLabel("Modo de importação").selectOption("reference");
    await selectFiles(app, [image, audio]);
    await page
      .getByRole("button", { name: "Importar mídia", exact: false })
      .click();
    await expect(page.getByRole("status")).toContainText(
      "2 arquivo(s) importado(s)",
      { timeout: 45000 },
    );
    await expect(page.locator(".error")).toHaveCount(0);
    let state = await page.evaluate(() => window.cliprush.workspace());
    let project = state.projects[0];
    expect(project.assets[0].width).toBeGreaterThan(0);
    expect(project.assets[1].duration).toBeGreaterThan(20);
    expect(
      project.assets.every((asset) => asset.mode === "reference"),
    ).toBeTruthy();
    await rename(image, moved);
    await page
      .getByRole("button", { name: "Meus projetos", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Abrir Offline reference test",
        exact: true,
      })
      .click();
    await expect(
      page.getByText("Arquivo ausente", { exact: true }),
    ).toBeVisible();
    await selectFiles(app, [moved]);
    await page
      .getByRole("button", { name: "Localizar original.jpg", exact: true })
      .click();
    await expect(
      page.getByText("Arquivo ausente", { exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Meus projetos", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Duplicar Offline reference test",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Abrir Offline reference test — cópia",
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: "Arquivar Offline reference test — cópia",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Abrir Offline reference test — cópia",
        exact: true,
      }),
    ).toHaveCount(0);
    await page.getByLabel("Arquivados").check();
    await page
      .getByRole("button", {
        name: "Restaurar Offline reference test — cópia",
        exact: true,
      })
      .click();
    await page.getByLabel("Arquivados").uncheck();
    await page
      .getByRole("button", {
        name: "Abrir Offline reference test",
        exact: true,
      })
      .click();
    await selectFiles(app, [dataDirectory]);
    await page.getByRole("button", { name: "Empacotar projeto" }).click();
    await expect(page.getByRole("status")).toContainText("Pacote salvo");
    const packageName = (await readdir(dataDirectory)).find((name) =>
      name.startsWith("ClipRush-"),
    )!;
    const manifestPath = path.join(
      dataDirectory,
      packageName,
      "project.cliprush.json",
    );
    await page
      .getByRole("button", { name: "Configurações", exact: true })
      .click();
    await selectFiles(app, [dataDirectory]);
    await page
      .getByRole("button", { name: "Abrir outro workspace", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("Workspace alterado");
    state = await page.evaluate(() => window.cliprush.workspace());
    expect(state.projects).toHaveLength(0);
    await selectFiles(app, [manifestPath]);
    await page
      .getByRole("button", { name: "Importar projeto", exact: false })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Offline reference test",
        exact: true,
      }),
    ).toBeVisible();
    state = await page.evaluate(() => window.cliprush.workspace());
    project = state.projects[0];
    expect(
      state.channels.find((channel) => channel.id === project.channelId)?.name,
    ).toBe("Animation independent");
    expect(project.assets.every((asset) => asset.mode === "copy")).toBeTruthy();
    expect(project.assets[1].duration).toBeGreaterThan(20);
    // Tampered packages must not add a project or access arbitrary files.
    const raw = JSON.parse(await readFile(manifestPath, "utf8"));
    raw.assets[0].path = "../../outside.jpg";
    const malicious = path.join(dataDirectory, "malicious.json");
    await writeFile(malicious, JSON.stringify(raw));
    await selectFiles(app, [malicious]);
    await page
      .getByRole("button", { name: "Importar projeto", exact: false })
      .click();
    await expect(page.getByRole("alert")).toBeVisible();
    expect(
      (await page.evaluate(() => window.cliprush.workspace())).projects,
    ).toHaveLength(1);
  } finally {
    await app.close();
  }
});
