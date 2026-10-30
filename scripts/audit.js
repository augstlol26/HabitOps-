// Static audit for HabitCraft: duplicate ids, missing ids referenced from JS,
// inline handlers that call functions which do not exist, broken local refs.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const jsFiles = ['js/app.js', 'js/state.js', 'js/audio.js'];
const js = jsFiles.map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');

let problems = 0;
const report = (kind, msg) => { problems++; console.log(`[${kind}] ${msg}`); };

// 1. duplicate ids
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const seen = new Map();
ids.forEach(id => seen.set(id, (seen.get(id) || 0) + 1));
for (const [id, n] of seen) if (n > 1) report('DUP-ID', `${id} x${n}`);

// 2. getElementById('x') in JS with no matching id in HTML (ignoring ids built at runtime)
const dynamicPrefixes = ['quest-card-', 'arrow-', 'telemetry-'];
const idSet = new Set(ids);
for (const m of js.matchAll(/getElementById\(\s*['"]([^'"]+)['"]\s*\)/g)) {
  const id = m[1];
  if (!idSet.has(id) && !dynamicPrefixes.some(p => id.startsWith(p))) report('MISSING-ID', id);
}

// 3. inline on*="fn(" handlers calling undefined global functions
const defined = new Set([...js.matchAll(/function\s+([A-Za-z0-9_]+)\s*\(/g)].map(m => m[1]));
const builtins = new Set(['event', 'showToast', 'document', 'window', 'return', 'if']);
for (const m of html.matchAll(/\son[a-z]+="([^"]+)"/g)) {
  for (const call of m[1].matchAll(/([A-Za-z_][A-Za-z0-9_.]*)\s*\(/g)) {
    const name = call[1];
    if (name.includes('.')) continue;
    if (!defined.has(name) && !builtins.has(name)) report('UNDEFINED-FN', `${name}() used in inline handler`);
  }
}

// 4. local file references
for (const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const ref = m[1];
  if (/^(https?:|data:|mailto:|#)/.test(ref)) continue;
  if (!fs.existsSync(path.join(root, ref))) report('MISSING-FILE', ref);
}

// 5. external network dependencies (matter for an offline APK)
for (const m of html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)) report('EXTERNAL-DEP', m[1]);

console.log(problems === 0 ? 'AUDIT CLEAN' : `${problems} problem(s) found`);
process.exit(problems === 0 ? 0 : 1);

