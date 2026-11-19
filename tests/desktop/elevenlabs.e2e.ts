import { test, expect, _electron as electron } from "@playwright/test";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

test("voice test crosses secure IPC, plays MP3, caches audio and preserves approved script", async () => {
  const directory = await mkdtemp(path.resolve("out/elevenlabs-ui-"));
  const credentialFile = path.join(directory, "fixture.env");
  await writeFile(credentialFile, "ELEVENLABS_API_KEY=fixture-key-never-real\nELEVENLABS_VOICE_ID=fixture-voice\nELEVENLABS_MODEL_ID=eleven_v4");
  const mp3 = path.join(directory, "fixture.mp3");
  execFileSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=0.5", mp3], { windowsHide: true });
  const bytes = [...await readFile(mp3)];
  const env: NodeJS.ProcessEnv = { ...process.env, CLIPRUSH_DATA_HOME: directory };
  delete env.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({ args: ["."], executablePath: process.env.CLIPRUSH_TEST_ELECTRON,
    env: Object.fromEntries(Object.entries(env).filter((entry): entry is [string, string] => entry[1] !== undefined)) });
  try {
    await app.evaluate(({ dialog }, { credentialFile, bytes }) => {
      dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [credentialFile] });
      const state = globalThis as typeof globalThis & { fixturePosts: number; fixturePermissionError: boolean };
      state.fixturePosts = 0; state.fixturePermissionError = false;
      globalThis.fetch = async (input, options) => {
        if (!String(input).startsWith("https://api.elevenlabs.io/v1/")) throw new Error("External network disabled in test");
        if (state.fixturePermissionError) return Response.json({ detail: { status: "missing_permissions", message: "fixture-key-never-real" } }, { status: 401 });
        if (String(input).endsWith("/settings")) return Response.json({ stability: 0.5, similarity_boost: 0.7 });
        if (options?.method === "POST") {
          state.fixturePosts++;
          return new Response(new Uint8Array(bytes), { headers: { "Content-Type": "audio/mpeg" } });
        }
        throw new Error("Unexpected API operation");
      };
    }, { credentialFile, bytes });
    const page = await app.firstWindow();
    await page.waitForFunction(() => Boolean(window.cliprush));
    await page.getByRole("button", { name: /Novo projeto/ }).click();
    await page.locator('input[name="name"]').fill("ElevenLabs UI fixture");
    await page.getByRole("button", { name: "Criar projeto", exact: true }).click();
    const project = (await page.evaluate(() => window.cliprush.workspace())).projects.find(p => p.name === "ElevenLabs UI fixture")!;
    await page.getByRole("button", { name: "Importar credenciais ElevenLabs", exact: true }).click();
    await expect(page.getByText("Credenciais salvas no armazenamento seguro do sistema.")).toBeVisible();
    const encrypted = await readFile(path.join(directory, "elevenlabs.secure"));
    expect(encrypted.includes(Buffer.from("fixture-key-never-real"))).toBe(false);
    await page.getByRole("button", { name: "Testar voz Augusto Norte", exact: true }).click();
    const audio = page.getByLabel("Teste da voz ClipRush");
    await expect(audio).toBeVisible();
    await expect.poll(() => audio.evaluate(element => (element as HTMLAudioElement).duration)).toBeGreaterThan(0);
    await page.getByRole("button", { name: "Testar voz Augusto Norte", exact: true }).click();
    await expect(page.getByText("Teste recuperado do cache.")).toBeVisible();
    expect(await app.evaluate(() => (globalThis as typeof globalThis & { fixturePosts: number }).fixturePosts)).toBe(1);
    const script = "Texto aprovado no painel.";
    await page.getByLabel("Roteiro para narração", { exact: true }).fill(script);
    await expect(page.getByRole("button", { name: "Aprovar roteiro e gerar vídeo", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Salvar projeto", exact: true }).click();
    expect((await page.evaluate(() => window.cliprush.workspace())).projects.find(p => p.id === project.id)?.generation?.narrationScript).toBe(script);
    await app.evaluate(() => { (globalThis as typeof globalThis & { fixturePermissionError: boolean }).fixturePermissionError = true; });
    await page.getByRole("button", { name: "Testar voz Augusto Norte", exact: true }).click();
    await expect(page.getByText(/Voices: Read/)).toBeVisible();
    expect(await page.locator("body").innerText()).not.toContain("fixture-key-never-real");
    expect(await page.locator("body").innerText()).not.toContain("Error invoking remote method");
    await page.screenshot({ path: path.join(directory, "voice-ui.png"), fullPage: true });
    console.log(`Isolated voice UI artifacts: ${directory}`);
  } finally { await app.close(); }
});
