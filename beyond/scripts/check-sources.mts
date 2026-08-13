/**
 * Beyond — kaynak sayfa tarayıcısı.
 *
 *   npm run check-sources
 *
 * Katalogdaki her programın kaynak sayfasını indirir, parmak izini ve
 * sayısal sinyallerini çıkarır, önceki taramayla karşılaştırır ve sonucu
 * src/data/source-checks.json dosyasına yazar.
 *
 * Arayüz bu dosyayı okuyup kartlarda "kaynak sayfa değişti" rozeti gösteriyor.
 * Katalog ASLA otomatik değiştirilmez — bkz. src/lib/freshness.ts başlığı.
 */

import fs from "node:fs";
import path from "node:path";
import { PROGRAMS } from "../src/data/programs.js";
import { fetchPageText, PageFetchError } from "../src/lib/fetch-page.js";
import {
  extractSignals,
  findDiscrepancies,
  fingerprint,
  type SourceCheck,
  type SourceCheckFile,
} from "../src/lib/freshness.js";

const OUT = path.join("src", "data", "source-checks.json");
const CONCURRENCY = 6;

function loadPrevious(): SourceCheckFile {
  try {
    return JSON.parse(fs.readFileSync(OUT, "utf8")) as SourceCheckFile;
  } catch {
    return { generatedAt: "", checks: {} };
  }
}

async function checkOne(
  program: (typeof PROGRAMS)[number],
  previous: SourceCheck | undefined,
  now: string
): Promise<SourceCheck> {
  try {
    const page = await fetchPageText(program.sourceUrl);
    const fp = fingerprint(page.text);
    const signals = extractSignals(page.text);
    const discrepancies = findDiscrepancies(program, signals);

    // İlk taramada "değişti" demek yanlış olur — referans noktası oluşuyor.
    const isFirstScan = !previous || previous.status === "unreachable";
    const changed = !isFirstScan && previous.fingerprint !== fp;

    return {
      programId: program.id,
      status: changed ? "changed" : "ok",
      fingerprint: fp,
      changedAt: changed ? now : (previous?.changedAt ?? null),
      checkedAt: now,
      discrepancies,
    };
  } catch (error) {
    return {
      programId: program.id,
      status: "unreachable",
      fingerprint: previous?.fingerprint ?? "",
      changedAt: previous?.changedAt ?? null,
      checkedAt: now,
      discrepancies: previous?.discrepancies ?? [],
      error: error instanceof PageFetchError ? error.message : "Bilinmeyen hata",
    };
  }
}

async function main() {
  const previous = loadPrevious();
  const now = new Date().toISOString();
  const checks: Record<string, SourceCheck> = {};

  console.log(`${PROGRAMS.length} program taranıyor…\n`);

  for (let i = 0; i < PROGRAMS.length; i += CONCURRENCY) {
    const batch = PROGRAMS.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map((p) => checkOne(p, previous.checks[p.id], now))
    );
    for (const result of results) {
      checks[result.programId] = result;
      const icon =
        result.status === "ok" ? "·" : result.status === "changed" ? "▲" : "✗";
      const note =
        result.status === "unreachable"
          ? ` — ${result.error}`
          : result.discrepancies.length > 0
            ? ` — ${result.discrepancies.length} fark`
            : "";
      console.log(`  ${icon} ${result.programId}${note}`);
    }
  }

  const file: SourceCheckFile = { generatedAt: now, checks };
  fs.writeFileSync(OUT, JSON.stringify(file, null, 2) + "\n");

  const list = Object.values(checks);
  const changed = list.filter((c) => c.status === "changed").length;
  const unreachable = list.filter((c) => c.status === "unreachable").length;
  const withDiff = list.filter((c) => c.discrepancies.length > 0).length;

  console.log(
    `\nÖzet: ${list.length} program · ${changed} sayfa değişti · ` +
      `${withDiff} kayıtta sayısal fark · ${unreachable} ulaşılamadı`
  );
  console.log(`Yazıldı: ${OUT}`);
}

await main();
