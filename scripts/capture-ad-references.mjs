import { Browser } from 'file:///C:/Users/AUGUSTINE/.gemini/config/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const outDir = resolve('assets/references');
const artifactDir = 'C:/Users/AUGUSTINE/.gemini/antigravity/brain/30467cde-257e-44b7-8b18-67b72357614f';
mkdirSync(outDir, { recursive: true });

const browser = await Browser.launch();

// 1. Mobile Phone (iPhone 15 Pro / Galaxy S24: 393 x 852, dsf 2 for crisp retina ad quality)
const page = await browser.newPage({ width: 393, height: 852, dsf: 2, mobile: true });
await page.goto('http://localhost:4040/habitops/index.html', { timeoutMs: 30000 });

// Wait for fonts & layout
await page.eval('document.fonts.ready.then(() => true)');

// Helper to save screenshot both to project references and artifact dir
async function capture(name, desc) {
  const localPath = join(outDir, `${name}.png`);
  const artifactPath = join(artifactDir, `${name}.png`);
  await page.screenshot({ path: localPath, quality: 95 });
  copyFileSync(localPath, artifactPath);
  console.log(`✓ Captured ${name}: ${desc}`);
}

// ----------------------------------------------------
// SHOT 1: Today Screen — Active Boss Battle HUD & Mission Loadout
// ----------------------------------------------------
await page.eval(() => {
  // Ensure we are on today view and onboarding is closed
  const ob = document.getElementById('view-onboarding');
  if (ob) ob.style.display = 'none';
  if (window.navigateTo) window.navigateTo('today');
});
await new Promise(r => setTimeout(r, 600));
await capture('habitops_ref_01_today_boss_hud', 'Today Screen: Boss Encounter & Tactical Protocol Loadout');

// ----------------------------------------------------
// SHOT 2: Action Shot — Protocol Check-in Slash Beam & Crit Impact
// ----------------------------------------------------
await page.eval(() => {
  // Trigger check-in animation and slash beam
  const bossCard = document.getElementById('boss-card');
  if (bossCard) {
    bossCard.classList.add('boss-damage-shake');
    const slash = document.createElement('div');
    slash.className = 'slash-flash-active';
    bossCard.appendChild(slash);
  }
  
  // Show floating damage numbers
  if (window.showDamageNumber) {
    window.showDamageNumber(bossCard, 120, true);
  }

  // Show action toast
  if (window.showToast) {
    window.showToast('Protocol Executed • +120 XP', 'Critical Strike on Procrastination Titan');
  }
});
await new Promise(r => setTimeout(r, 200));
await capture('habitops_ref_02_strike_slash_action', 'Live Action: Slash Flash Beam, Critical Impact & XP Surge');

// Reset action effects
await page.eval(() => {
  const slashes = document.querySelectorAll('.slash-flash-active');
  slashes.forEach(s => s.remove());
  const toast = document.getElementById('action-toast');
  if (toast) toast.classList.add('opacity-0', 'pointer-events-none');
});

// ----------------------------------------------------
// SHOT 3: Dossier & Level 1–200 Progression Roadmap
// ----------------------------------------------------
await page.eval(() => {
  if (window.openRankRoadmapModal) window.openRankRoadmapModal();
});
await new Promise(r => setTimeout(r, 500));
await capture('habitops_ref_03_rank_roadmap_dossier', 'Operative Dossier: Level 1–200 Progression Ladder & Specializations');

// Close modal
await page.eval(() => {
  if (window.closeRankRoadmapModal) window.closeRankRoadmapModal();
});
await new Promise(r => setTimeout(r, 400));

// ----------------------------------------------------
// SHOT 4: Protocols Armory & Suggested Stacks
// ----------------------------------------------------
await page.eval(() => {
  if (window.navigateTo) window.navigateTo('habits-lab');
});
await new Promise(r => setTimeout(r, 600));
await capture('habitops_ref_04_protocols_armory', 'Protocols Roster: Tactical Battle Stacks, Routines & Custom Missions');

// ----------------------------------------------------
// SHOT 5: Tactical Review & Performance Analytics
// ----------------------------------------------------
await page.eval(() => {
  if (window.navigateTo) window.navigateTo('weekly-review');
});
await new Promise(r => setTimeout(r, 600));
await capture('habitops_ref_05_review_analytics', 'Review Dashboard: Protocol Hit Matrix, Deep Work Radar & Discipline Score');

// ----------------------------------------------------
// SHOT 6: Desktop / Tablet Command View (Tablet 768x1024)
// ----------------------------------------------------
await page.setViewport({ width: 768, height: 1024, dsf: 2, mobile: false });
await page.eval(() => {
  if (window.navigateTo) window.navigateTo('today');
});
await new Promise(r => setTimeout(r, 600));
await capture('habitops_ref_06_tablet_command_center', 'Tablet Command View: Full Responsive Mission Canvas');

console.log('All real app reference images captured successfully!');
await browser.close();
