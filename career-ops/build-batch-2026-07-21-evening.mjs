#!/usr/bin/env node
/**
 * Batch: Umbrel PD + Rwazi Director PD — 2026-07-21 evening
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'output', 'applications');
const DATE = '21 July 2026';

const candidate = {
  name: 'Polina Tsoy',
  email: 'neolissa@gmail.com',
  phone: '+79525364225',
  location: 'Argentina — near Buenos Aires (remote, ART UTC-3)',
  credentials: ['Senior Product Designer', 'English C1', '10+ years'],
};

const baseHtml = readFileSync(
  join(OUT, 'sent', 'overflow-senior-pd', 'cv-polina-tsoy-overflow-senior-pd.html'),
  'utf8'
);

const packs = [
  {
    slug: 'umbrel-product-designer',
    company: 'Umbrel',
    role: 'Product Designer',
    applyUrl: 'https://jobs.ashbyhq.com/umbrel/0c4657db-0d05-42f0-ad3e-8fac6b3fd6f1',
    geo: 'Remote · soft (Anywhere)',
    salaryAsk: '$75,000 USD (target $60–90K)',
    summarySwap:
      'Senior Product Designer with 10+ years shipping polished product UX — craft obsession, micro-interactions, and end-to-end ownership from flows to production UI. 6+ years fully remote. Excited about Umbrel’s product design for umbrelOS, first-party apps, and umbrel.com — where details and delight matter.',
    cover: {
      role_title: 'Product Designer',
      company: 'Umbrel',
      city: 'Remote',
      date: DATE,
      greeting: 'Dear Hiring Team,',
      opening:
        'Umbrel is building personal server experiences that need craft, clarity, and delight — umbrelOS, first-party apps, and the website. I am applying as Product Designer because that is how I work: high craft in Figma, willingness to throw away weak ideas, and shipping with engineering.',
      profile_intro:
        'Senior Product Designer, 10+ years, English C1, remote 6+ years. Based in Argentina. Portfolio: https://neolissa.github.io/polina-tsoy-designer/en/',
      achievements: [
        {
          lead: 'Craft + multi-surface',
          impact: 'TVIP across 5 platforms — personas, day/night themes, coherent UI kit.',
        },
        {
          lead: 'Systems that speed polish',
          impact: 'WUW design system — −90% styles, ×3 delivery, White Label unlocked.',
        },
        {
          lead: 'Clarity under complexity',
          impact: 'DocsBird onboarding — 7→3 steps, +45% conversion.',
        },
      ],
      problems_section:
        'I obsess over details and micro-interactions, collaborate openly with engineers, and know when to ship. Comp ask $75K USD.',
      closing: 'Happy to walk through craft-heavy cases and discuss umbrelOS design challenges.',
      footnotes: [
        { marker: 'Portfolio:', text: 'Cases', url: 'https://neolissa.github.io/polina-tsoy-designer/en/' },
      ],
    },
    formAnswers: `# Umbrel — Product Designer — answers

**Apply:** https://jobs.ashbyhq.com/umbrel/0c4657db-0d05-42f0-ad3e-8fac6b3fd6f1

Location: Argentina remote (Anywhere soft).
Comp: $75K USD.
Portfolio: https://neolissa.github.io/polina-tsoy-designer/en/

«отправила» → Applied + \`sent/\`
`,
  },
  {
    slug: 'rwazi-director-pd',
    company: 'Rwazi',
    role: 'Director of Product Design (SaaS)',
    applyUrl: 'https://jobs.ashbyhq.com/rwazi/26aba173-2189-42d5-b9be-1ca1d832ee79',
    geo: 'Global (Remote) · soft',
    salaryAsk: '$75,000–90,000 USD (target $60–90K)',
    summarySwap:
      'Senior Product Designer / Director-track IC with 10+ years in complex B2B SaaS — design systems, data-dense dashboards, and habit-forming workflows tied to adoption metrics. 6+ years fully remote. Note: previously applied to Senior Product Designer at Rwazi; this Director IC track matches systems ownership and enterprise UX depth.',
    cover: {
      role_title: 'Director of Product Design (SaaS)',
      company: 'Rwazi',
      city: 'Global Remote',
      date: DATE,
      greeting: 'Dear Hiring Team,',
      opening:
        'Rwazi turns consumer intelligence into enterprise habit — dashboards, workflows, and a design system that must drive repeat usage and expansion. I am applying for Director of Product Design (hands-on IC) because that matches how I already work: systems thinking, data-dense UX, and metrics-tied outcomes.',
      profile_intro:
        'Senior Product Designer, 10+ years, English C1, remote 6+ years. Portfolio: https://neolissa.github.io/polina-tsoy-designer/en/',
      achievements: [
        {
          lead: 'Systems ownership',
          impact: 'WUW design system — −90% styles, ×3 speed, White Label as growth unlock.',
        },
        {
          lead: 'Adoption / habit',
          impact: 'Relaunch employee platform — ×4 session time, +40% engagement, 100% adoption.',
        },
        {
          lead: 'Complex B2B clarity',
          impact: 'DocsBird international flows — +45% conversion; TVIP multi-audience IA.',
        },
      ],
      problems_section:
        'I previously applied to Senior Product Designer at Rwazi — this Director role is the IC systems/strategy track I want. Comp ask $75–90K USD.',
      closing: 'Happy to discuss enterprise dashboard UX and design-as-growth.',
      footnotes: [
        { marker: 'Portfolio:', text: 'Cases', url: 'https://neolissa.github.io/polina-tsoy-designer/en/' },
      ],
    },
    formAnswers: `# Rwazi — Director of Product Design — answers

**Apply:** https://jobs.ashbyhq.com/rwazi/26aba173-2189-42d5-b9be-1ca1d832ee79

Already applied Senior PD — this is a different IC Director track (not people-management).
Location: Argentina · Global Remote.
Comp: $75–90K USD.

«отправила» → Applied + \`sent/\`
`,
  },
];

function tweakHtml(summary) {
  return baseHtml.replace(/(<div class="summary-text">)([\s\S]*?)(<\/div>)/, `$1${summary}$3`);
}

function coverTxt(letter) {
  const ach = letter.achievements.map((a) => `• ${a.lead}: ${a.impact}`).join('\n');
  return `${letter.greeting}

${letter.opening}

${letter.profile_intro}

${ach}

${letter.problems_section}

${letter.closing}

Polina Tsoy
neolissa@gmail.com | +79525364225
https://neolissa.github.io/polina-tsoy-designer/en/
`;
}

for (const p of packs) {
  const dir = join(OUT, p.slug);
  mkdirSync(dir, { recursive: true });
  const htmlPath = join(dir, `cv-polina-tsoy-${p.slug}.html`);
  writeFileSync(htmlPath, tweakHtml(p.summarySwap));
  writeFileSync(join(dir, 'cover-payload.json'), JSON.stringify({ candidate, letter: p.cover, output_path: join(dir, `cover-polina-tsoy-${p.slug}.pdf`) }, null, 2));
  writeFileSync(join(dir, 'cover.txt'), coverTxt(p.cover));
  writeFileSync(join(dir, 'FORM-ANSWERS.md'), p.formAnswers);
  writeFileSync(
    join(dir, 'APPLY.md'),
    `# Application pack — ${p.company} — ${p.role}

**JD / Apply:** ${p.applyUrl}
**Date:** 2026-07-21
**Geo:** ${p.geo}
**Comp ask:** ${p.salaryAsk}

## Files
- \`cv-polina-tsoy-${p.slug}.pdf\`
- \`cover-polina-tsoy-${p.slug}.pdf\`

Polina Submit — do not auto-submit
`
  );
  const pdfPath = join(dir, `cv-polina-tsoy-${p.slug}.pdf`);
  let r = spawnSync('node', [join(ROOT, 'generate-pdf.mjs'), htmlPath, pdfPath, '--format=a4'], { cwd: ROOT, encoding: 'utf8' });
  console.log('CV', p.slug, r.status, (r.stderr || r.stdout || '').slice(-120));
  r = spawnSync('node', [join(ROOT, 'generate-cover-letter.mjs'), '--payload', join(dir, 'cover-payload.json')], { cwd: ROOT, encoding: 'utf8' });
  const flat = join(ROOT, 'output', `cover-polina-tsoy-${p.slug}.pdf`);
  const nested = join(dir, `cover-polina-tsoy-${p.slug}.pdf`);
  if (existsSync(flat) && flat !== nested) copyFileSync(flat, nested);
  console.log('COVER', p.slug, r.status);
}
