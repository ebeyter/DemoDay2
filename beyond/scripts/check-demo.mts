/**
 * Demo iddialarını gerçek katalogla ölçer.
 *
 * NEDEN: README'de "IELTS 6.0 → 7.0 Güvenli bandı 0'dan 4'e çıkarıyor" gibi
 * sayılar var ve bunlar sahnede söyleniyor. Katalog her düzeltmede değişiyor;
 * bu sayılar elle takip edilemez. Bu betik onları ölçüp yazar, ayrıca demoda
 * hangi programların ekrana geleceğini listeler — doğrulama turunun hangi
 * kayıtlara odaklanacağını bu liste belirler.
 *
 *   npm run check-demo
 */
import { PROGRAMS } from "../src/data/programs.js";
import {
  DEMO_PROFILE,
  DEMO_SCENARIO_COUNTRY,
  DEMO_IELTS_BEFORE,
  DEMO_IELTS_AFTER,
} from "../src/data/demo-profile.js";
import { matchAll } from "../src/lib/matching.js";
import type { Band, StudentProfile } from "../src/lib/types.js";

type Counts = Record<Band, number>;

function withIelts(score: number): StudentProfile {
  return { ...DEMO_PROFILE, languageTests: [{ test: "ielts", score }] };
}

function tally(profile: StudentProfile, countries?: string[]): Counts {
  const results = matchAll(
    PROGRAMS,
    profile,
    countries ? { countries: countries as never } : {}
  );
  const counts: Counts = { safety: 0, match: 0, reach: 0, "out-of-reach": 0 };
  for (const r of results) counts[r.band]++;
  return counts;
}

function visible(profile: StudentProfile, countries?: string[]) {
  return matchAll(PROGRAMS, profile, countries ? { countries: countries as never } : {})
    .filter((r) => r.band !== "out-of-reach")
    .sort((a, b) => b.fitScore - a.fitScore);
}

const before = tally(withIelts(DEMO_IELTS_BEFORE));
const after = tally(withIelts(DEMO_IELTS_AFTER));
const scenario = tally(withIelts(DEMO_IELTS_AFTER), [DEMO_SCENARIO_COUNTRY]);

const line = (label: string, c: Counts) =>
  `  ${label.padEnd(22)} Güvenli ${c.safety}  ·  Uygun ${c.match}  ·  Zorlayıcı ${c.reach}  ·  Erişilemez ${c["out-of-reach"]}`;

console.log(`\nDemo profili: not ${DEMO_PROFILE.gpa}/${DEMO_PROFILE.gpaScale}, alanlar ${DEMO_PROFILE.fields.join(", ")}`);
console.log(`Katalog: ${PROGRAMS.length} program\n`);
console.log(line(`IELTS ${DEMO_IELTS_BEFORE}`, before));
console.log(line(`IELTS ${DEMO_IELTS_AFTER}`, after));
console.log(
  `\n  README'ye yazılacak cümle: IELTS ${DEMO_IELTS_BEFORE} → ${DEMO_IELTS_AFTER} tek değişikliği ` +
    `Güvenli bandı ${before.safety}'dan ${after.safety} programa çıkarıyor, ` +
    `Zorlayıcı ${before.reach}'dan ${after.reach}'e iniyor.`
);

console.log(`\n  Senaryo "sadece ${DEMO_SCENARIO_COUNTRY}" (IELTS ${DEMO_IELTS_AFTER}):`);
console.log(line(`  ${DEMO_SCENARIO_COUNTRY}`, scenario));
const scenarioTotal = scenario.safety + scenario.match + scenario.reach;
if (scenarioTotal <= 2) {
  console.log(
    `  ⚠ Senaryo modunda yalnızca ${scenarioTotal} kart çıkıyor — sahnede zayıf bir an.`
  );
}

console.log(`\n=== Demoda ekrana gelen kayıtlar (IELTS ${DEMO_IELTS_AFTER}) ===`);
console.log("    Bunlar doğrulama turunun hedefi. 'ai-extracted' olanlar rozeti kırmızı gösterir.\n");
for (const r of visible(withIelts(DEMO_IELTS_AFTER))) {
  const p = r.program;
  const flag = p.verification === "verified" ? "✓" : "·";
  console.log(
    `  ${flag} ${r.band.padEnd(7)} ${String(r.fitScore).padStart(3)}  ${p.id.padEnd(28)}${p.verification}`
  );
}

const verifiedVisible = visible(withIelts(DEMO_IELTS_AFTER)).filter(
  (r) => r.program.verification === "verified"
).length;
const totalVisible = visible(withIelts(DEMO_IELTS_AFTER)).length;
console.log(
  `\n  Ekrandaki ${totalVisible} kayıttan ${verifiedVisible} tanesi doğrulanmış.` +
    (verifiedVisible === 0
      ? " Doğrulama rozeti demoda hiç yeşil görünmüyor."
      : "")
);
console.log();
