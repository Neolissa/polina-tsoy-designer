#!/usr/bin/env node
/**
 * Batch: Plain + Linear (Europe) — 2026-07-21
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
    slug: 'plain-senior-pd',
    company: 'Plain',
    role: 'Senior Product Designer',
    applyUrl: 'https://jobs.ashbyhq.com/plain/4c7be946-dba7-4862-b0fb-4cf448139259',
    geo: 'UK · soft (remote-first startup; form TBD)',
    salaryAsk: '$75,000 USD (target $60–90K; open to GBP/EUR geo-adjusted)',
    summarySwap:
      'Senior Product Designer with 10+ years in B2B SaaS — end-to-end ownership from customer insight to shipped UI, design systems, and close engineering partnership. 6+ years fully remote. Excited about Plain’s mission to redefine B2B customer support with AI-native, channel-first workflows.',
    cover: {
      role_title: 'Senior Product Designer',
      company: 'Plain',
      city: 'Remote · UK',
      date: DATE,
      greeting: 'Dear Hiring Team,',
      opening:
        'Plain is redefining B2B support — unified channels, AI-assisted workflows, and craft that earns trust in complex products. I am applying because that matches how I work: senior IC ownership, systems thinking, and shipping outcomes with engineering, not handoffs.',
      profile_intro:
        'Senior Product Designer, 10+ years, English C1, remote 6+ years. Based in Argentina (EU/UK overlap). Portfolio: https://neolissa.github.io/polina-tsoy-designer/en/',
      achievements: [
        {
          lead: 'B2B trust & activation',
          impact: 'DocsBird international onboarding — 7→3 steps, +45% conversion, 4-country launch.',
        },
        {
          lead: 'Systems at speed',
          impact: 'WUW design system — 35 components, −90% styles, ×3 delivery speed.',
        },
        {
          lead: 'Complex multi-surface UX',
          impact: 'TVIP admin + consumer across 5 platforms — coherent IA and patterns.',
        },
      ],
      problems_section:
        'Comfortable collaborating in the open, prototyping with AI-assisted tools, and partnering on buildable UI (HTML/CSS literacy). Comp ask $75K USD geo-adjusted.',
      closing: 'Happy to walk through B2B case studies and discuss support/workflow UX.',
      footnotes: [
        { marker: 'Portfolio:', text: 'Cases', url: 'https://neolissa.github.io/polina-tsoy-designer/en/' },
      ],
    },
    formAnswers: `# Plain — Senior Product Designer — answers

**Apply:** https://jobs.ashbyhq.com/plain/4c7be946-dba7-4862-b0fb-4cf448139259

Location: Argentina (remote; UK/EU hours overlap).
Comp: $75K USD.
Portfolio: https://neolissa.github.io/polina-tsoy-designer/en/
LinkedIn: empty.

If UK right-to-work asked: honest — remote from Argentina; EOR path like other UK startups.

«отправила» → Applied + \`sent/\`
`,
  },
  {
    slug: 'linear-principal-pd-europe',
    company: 'Linear',
    role: 'Principal Product Designer',
    applyUrl: 'https://jobs.ashbyhq.com/linear/ba8a41d2-4198-481a-a7f4-e09c5364ff7f',
    geo: 'Europe · soft (JD: Europe/North America; stretch Principal level)',
    salaryAsk: '$75,000–90,000 USD (target $60–90K; open to geo-adjusted offer)',
    summarySwap:
      'Senior Product Designer (Principal-track) with 10+ years shipping high-craft product UX — systems thinking, async remote collaboration, and end-to-end ownership. 6+ years fully remote. Passionate about tools for builders; actively using AI-assisted prototyping. Based in Argentina with strong EU timezone overlap.',
    cover: {
      role_title: 'Principal Product Designer',
      company: 'Linear',
      city: 'Remote · Europe',
      date: DATE,
      greeting: 'Dear Hiring Team,',
      opening:
        'Linear sets the bar for how product teams work — speed, focus, and craft in the tools themselves. I am applying for Principal Product Designer (Europe) because I want to bring senior end-to-end design leadership to that mission, with a track record of shipping complex B2B/B2C systems remotely.',
      profile_intro:
        'Senior Product Designer, 10+ years, English C1, remote 6+ years. Portfolio: https://neolissa.github.io/polina-tsoy-designer/en/',
      achievements: [
        {
          lead: 'Systems + velocity',
          impact: 'WUW design system — −90% styles, ×3 speed, White Label unlocked.',
        },
        {
          lead: 'Ambiguity → direction',
          impact: 'DocsBird 0→1 — reframed problem, +45% conversion, 4 countries.',
        },
        {
          lead: 'Multi-surface coherence',
          impact: 'TVIP across 5 platforms — personas, themes, shared patterns.',
        },
      ],
      problems_section:
        'Honest stretch: Principal title is a step up from my recent Senior IC scope — I bring senior ownership, systems leadership, and async communication at Linear’s bar. Based in Argentina; Europe overlap. Comp ask $75–90K USD geo-adjusted.',
      closing: 'Happy to discuss Europe remote setup and relevant case studies.',
      footnotes: [
        { marker: 'Portfolio:', text: 'Cases', url: 'https://neolissa.github.io/polina-tsoy-designer/en/' },
      ],
    },
    formAnswers: `# Linear — Principal PD (Europe) — answers

**Apply:** https://jobs.ashbyhq.com/linear/ba8a41d2-4198-481a-a7f4-e09c5364ff7f

Stretch: Principal level — cover states honest framing.
Location: **Argentina** (Europe timezone overlap).
Comp: $75–90K USD.

Use same work-auth framing as Synthesia if asked (Yes / Yes EOR).

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

  const payload = {
    candidate,
    letter: p.cover,
    output_path: join(dir, `cover-polina-tsoy-${p.slug}.pdf`),
  };
  writeFileSync(join(dir, 'cover-payload.json'), JSON.stringify(payload, null, 2));
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

## Next step
Polina Submit — do not auto-submit
`
  );

  const pdfPath = join(dir, `cv-polina-tsoy-${p.slug}.pdf`);
  spawnSync('node', [join(ROOT, 'generate-pdf.mjs'), htmlPath, pdfPath, '--format=a4'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  spawnSync('node', [join(ROOT, 'generate-cover-letter.mjs'), '--payload', join(dir, 'cover-payload.json')], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  const flat = join(ROOT, 'output', `cover-polina-tsoy-${p.slug}.pdf`);
  const nested = join(dir, `cover-polina-tsoy-${p.slug}.pdf`);
  if (existsSync(flat) && flat !== nested) copyFileSync(flat, nested);
  console.log('OK', p.slug);
}
