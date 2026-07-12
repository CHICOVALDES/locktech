import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, writeFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Time-lapse "Recovery": captura 4 fotos por día del stream online a horarios
// fijos, hasta que conectemos una cámara en la oficina. La captura es del lado
// del servidor (el navegador no puede sacarle frame a un iframe de YouTube):
// yt-dlp resuelve la URL directa del stream y ffmpeg extrae 1 frame.
//
// Cuando haya cámara propia, se reemplaza STREAM_URL por su RTSP/HLS y el resto
// (agenda, almacenamiento, manifest, UI) queda igual.

const execFileAsync = promisify(execFile);

// URL de canal en vivo (resiliente a reinicios del stream: yt-dlp resuelve el
// video en vivo actual del canal, no un id fijo).
const STREAM_URL = process.env.TIMELAPSE_STREAM_URL ?? "https://www.youtube.com/@Bali_Weather/live";

// Los 4 horarios diarios (hora local del servidor), formato "HH:MM".
export const CAPTURE_TIMES = (process.env.TIMELAPSE_TIMES ?? "07:00,12:00,17:00,21:00")
  .split(",")
  .map((t) => t.trim());

// Carpeta de salida: public/ del web para que Vite (y el build estático) las
// sirvan directo en /timelapse/... sin pasar por el API.
const here = path.dirname(fileURLToPath(import.meta.url));
const CAPTURE_DIR =
  process.env.TIMELAPSE_DIR ?? path.resolve(here, "../../../web/public/timelapse");

let ffmpegPath: string | null = null;
async function resolveFfmpeg(): Promise<string> {
  if (ffmpegPath) return ffmpegPath;
  const { stdout } = await execFileAsync("python", [
    "-c",
    "import imageio_ffmpeg as f; print(f.get_ffmpeg_exe())",
  ]);
  ffmpegPath = stdout.trim();
  return ffmpegPath;
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Captura un frame y lo guarda como <CAPTURE_DIR>/<date>/<slot>.jpg. */
export async function captureFrame(slot: string, date = today()): Promise<string> {
  const ffmpeg = await resolveFfmpeg();
  const dir = path.join(CAPTURE_DIR, date);
  await mkdir(dir, { recursive: true });
  const outPath = path.join(dir, `${slot}.jpg`);

  // 1) URL directa del stream (una sola línea con formato combinado).
  const { stdout } = await execFileAsync(
    "python",
    ["-m", "yt_dlp", "-g", "-f", "best[height<=720]/best", STREAM_URL],
    { timeout: 60_000 },
  );
  const url = stdout.split("\n").map((l) => l.trim()).filter(Boolean)[0];
  if (!url) throw new Error("yt-dlp no devolvió URL de stream");

  // 2) 1 frame -> JPG.
  await execFileAsync(
    ffmpeg,
    ["-y", "-loglevel", "error", "-i", url, "-frames:v", "1", "-q:v", "3", outPath],
    { timeout: 60_000 },
  );

  await writeManifest();
  console.log(`[timelapse] captura OK ${date} ${slot} -> ${outPath}`);
  return outPath;
}

interface ManifestShot {
  time: string; // "HH:MM"
  url: string; // "/timelapse/<date>/<slot>.jpg"
}
interface ManifestDay {
  date: string;
  shots: ManifestShot[];
}

/** Reescanea la carpeta y regenera manifest.json (lo consume el front). */
export async function writeManifest(): Promise<void> {
  if (!existsSync(CAPTURE_DIR)) await mkdir(CAPTURE_DIR, { recursive: true });
  const entries = await readdir(CAPTURE_DIR, { withFileTypes: true });
  const days: ManifestDay[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dayDir = path.join(CAPTURE_DIR, entry.name);
    const files = (await readdir(dayDir)).filter((f) => f.toLowerCase().endsWith(".jpg"));
    if (files.length === 0) continue;
    const shots: ManifestShot[] = files
      .map((f) => f.replace(/\.jpg$/i, ""))
      .sort()
      .map((slot) => ({
        time: slot.includes(":") ? slot : `${slot.slice(0, 2)}:${slot.slice(2, 4)}`,
        url: `/timelapse/${entry.name}/${slot}.jpg`,
      }));
    days.push({ date: entry.name, shots });
  }

  days.sort((a, b) => b.date.localeCompare(a.date)); // más reciente primero
  await writeFile(path.join(CAPTURE_DIR, "manifest.json"), JSON.stringify({ days, times: CAPTURE_TIMES }, null, 2));
}

/** True si ya existe la foto de ese slot hoy. */
function alreadyCaptured(slot: string, date = today()): boolean {
  return existsSync(path.join(CAPTURE_DIR, date, `${slot}.jpg`));
}

/**
 * Programa las 4 capturas diarias. Chequea cada 30s si la hora local coincide
 * con un slot y todavía no se capturó hoy. Simple y suficiente para la demo;
 * en producción sería un cron real / servicio persistente.
 */
export function startTimelapseScheduler(): () => void {
  console.log(`[timelapse] agenda activa: ${CAPTURE_TIMES.join(", ")} (hora local) -> ${CAPTURE_DIR}`);
  void writeManifest(); // deja el manifest listo aunque no haya fotos aún

  const interval = setInterval(async () => {
    const d = new Date();
    const hhmm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    if (!CAPTURE_TIMES.includes(hhmm)) return;
    const slot = hhmm.replace(":", "");
    if (alreadyCaptured(slot)) return;
    try {
      await captureFrame(slot);
    } catch (err) {
      console.warn(`[timelapse] captura ${slot} falló:`, (err as Error).message);
    }
  }, 30_000);

  return () => clearInterval(interval);
}
