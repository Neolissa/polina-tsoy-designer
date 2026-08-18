#!/usr/bin/env node
/**
 * One-shot: 5 soft-geo packs for 2026-07-20 batch.
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'output', 'applications');
const DATE = '20 July 2026';

const candidate = {
  name: 'Polina Tsoy',
  email: 'neolissa@gmail.com',
  phone: '+79525364225',
  location: 'Argentina — near Buenos Aires (remote, ART UTC-3)',
  credentials: ['Senior Product Designer', 'English C1', '10+ years'],
};

const baseHtml = readFileSync(
  join(OUT, 'sent', 'codepath-senior-product-designer', 'cv-polina-tsoy-codepath-senior-product-designer.html'),
  'utf8'
);

const packs = [
  {
    slug: 'customerio-senior-pd',
    company: 'Customer.io',
    role: 'Senior Product Designer',
    applyUrl: 'https://job-boards.greenhouse.io/customerio/jobs/8039027',
    geo: 'Americas Remote · soft',
    salaryAsk: '$75,000 USD (band listed $171–193K US-equivalent; open to geo-adjusted package in $60–90K target)',
    summarySwap:
      'Senior Product Designer with 10+ years shipping complex B2B SaaS — research-led, systems-minded, and proven in fully remote teams (6+ years). I own outcomes end-to-end: strategy through shipped UI, design-system contributions, and close partnership with engineering. Excited about Customer.io\'s messaging platform where craft, ownership, and AI-aware interaction design matter.',
    cover: {
      role_title: 'Senior Product Designer',
      company: 'Customer.io',
      city: 'Remote · Americas',
      date: DATE,
      greeting: 'Dear Hiring Team,',
      opening:
        "Customer.io powers automated messaging that people actually want — and that requires designers who own a product area end-to-end, not hand off mockups. I am applying because that is how I already work: research, systems, and shipped outcomes with engineering.",
      profile_intro:
        'I am a Senior Product Designer with 10+ years in product and 6+ years fully remote. English C1. Based in Argentina (Americas). Portfolio: https://neolissa.github.io/polina-tsoy-designer/en/',
      achievements: [
        {
          lead: 'DocsBird (ownership → metrics)',
          impact:
            'owned 0→1 international B2B flows — 4-country launch, registration 7→3 steps, +45% conversion.',
        },
        {
          lead: 'WakeupWarrior (systems)',
          impact:
            'evolutionary design system (35 components, tokens) — −90% styles, ×3 delivery speed, White Label unlocked.',
        },
        {
          lead: 'Relaunch (complex platform)',
          impact:
            'unified a fragmented internal ecosystem — ×4 session time, +40% engagement, 100% adoption.',
        },
      ],
      problems_section:
        'I close the gap between design and implementation, contribute to shared UI kits, and am actively expanding AI-assisted prototyping. Compensation ask: $75K USD geo-adjusted within Americas remote (target $60–90K).',
      closing: 'Happy to walk through portfolio cases and a working sample of end-to-end ownership.',
      footnotes: [
        { marker: 'Portfolio:', text: 'Cases', url: 'https://neolissa.github.io/polina-tsoy-designer/en/' },
      ],
    },
    formAnswers: `# Customer.io — Senior Product Designer — answers

**Apply:** https://job-boards.greenhouse.io/customerio/jobs/8039027
**Резюме / письмо:** в этой папке (PDF)

## Контакты
- Polina Tsoy · neolissa@gmail.com · +79525364225
- Location: Argentina (Americas Remote)
- Portfolio: https://neolissa.github.io/polina-tsoy-designer/en/

## Work auth
- Legally authorized where you reside: **Yes** (house framing: international remote from Argentina)
- If asked US auth: **N/A / not primarily US-based** (Argentina)

## Comp
**$75,000 USD** (target $60–90K; floor $24K). Band on JD is US-benchmarked — ask geo-adjusted.

## EEO
Female · White (Not Hispanic or Latino) · LGBTQIA+ No · Disability No · Veteran No · Consent Yes

## После отправки
«отправила» → Applied + move to \`sent/\`
`,
  },
  {
    slug: 'circle-lead-pd',
    company: 'Circle',
    role: 'Lead Product Designer',
    applyUrl: 'https://jobs.ashbyhq.com/circle/f24e6814-9722-4cc7-b49e-5ca21828e652',
    geo: 'Remote worldwide · soft (US-benchmarked pay globally)',
    salaryAsk: '$75,000–$90,000 USD (JD $140–170K Lead; open to Senior-level offer in geo band)',
    summarySwap:
      'Lead-shaped Product Designer (Senior IC) with 10+ years owning complex product areas end-to-end — 0→1 launches, multi-user flows, and design systems that raise the craft bar. Fully remote 6+ years. Strong Figma + HTML/CSS; actively building AI-assisted prototyping muscle. Honest about level: title history is Senior/Lead IC — ready to operate as the senior designer on an area.',
    cover: {
      role_title: 'Lead Product Designer',
      company: 'Circle',
      city: 'Remote worldwide',
      date: DATE,
      greeting: 'Dear Hiring Team,',
      opening:
        'Circle is hiring a Lead Product Designer to own a product area end-to-end — problem framing through shipped craft, with AI in the daily workflow. I am applying because that altitude matches how I already work as a senior IC.',
      profile_intro:
        'Senior Product Designer, 10+ years, 6+ years fully remote, English C1 (working toward C2 fluency in async writing). Portfolio: https://neolissa.github.io/polina-tsoy-designer/en/',
      achievements: [
        {
          lead: 'DocsBird (0→1 ownership)',
          impact: 'shaped direction under ambiguity — 4-country launch, +45% conversion after simplifying critical flows.',
        },
        {
          lead: 'WakeupWarrior (systems + speed)',
          impact: 'set reusable patterns (35 components, tokens) — −90% styles, ×3 speed.',
        },
        {
          lead: 'Relaunch (raise the bar)',
          impact: 'coherent multi-surface platform — ×4 session time, 100% adoption.',
        },
      ],
      problems_section:
        'Honest level note: my title history is Senior/Lead IC, not “Lead” on every paper. Circle notes Senior-level consideration within the published range — I am open to that. Comp ask $75–90K geo-adjusted (JD $140–170K US-benchmark). AI prototyping: active practice with modern tools alongside Figma/HTML/CSS.',
      closing: 'Glad to share a deep dive on end-to-end ownership and how I use AI in exploration.',
      footnotes: [
        { marker: 'Portfolio:', text: 'Cases', url: 'https://neolissa.github.io/polina-tsoy-designer/en/' },
      ],
    },
    formAnswers: `# Circle — Lead Product Designer — answers

**Apply:** https://jobs.ashbyhq.com/circle/f24e6814-9722-4cc7-b49e-5ca21828e652

## Контакты / location
Argentina remote · ART UTC-3 · worldwide OK

## Level honesty
Senior/Lead IC history; open to Senior-level offer if Lead bar is above current title paper.

## English
C1 Advanced (JD asks C2 — strong async writing; spoken C1).

## Comp
$75–90K USD geo-adjusted (target). Floor $24K.

## EEO defaults
Female · not LGBTQIA+ · no disability · White · consent Yes

«отправила» → Applied + \`sent/\`
`,
  },
  {
    slug: 'circle-lead-pd-marketplace',
    company: 'Circle',
    role: 'Lead Product Designer, Marketplace',
    applyUrl: 'https://jobs.ashbyhq.com/circle/b0bed2c6-d4c5-4e8e-b44d-7333372debbe',
    geo: 'Remote worldwide · soft · marketplace stretch',
    salaryAsk: '$75,000–$90,000 USD geo-adjusted',
    summarySwap:
      'Senior Product Designer with 10+ years on multi-sided and multi-audience products — creators/admins vs consumers, discovery under noise, and trust signals in complex flows. Fully remote 6+ years. Stretch note: strongest cases are B2B/international platforms and multi-platform consumer+admin (TVIP); applying because Discover’s two-sided problem maps to how I already balance competing user jobs.',
    cover: {
      role_title: 'Lead Product Designer, Marketplace',
      company: 'Circle',
      city: 'Remote worldwide',
      date: DATE,
      greeting: 'Dear Hiring Team,',
      opening:
        'Discover is a two-sided problem: creators need visibility and trust; members need signal through noise. I am applying for Lead Product Designer, Marketplace because I enjoy exactly this tension — multi-audience flows where trust and clarity decide conversion.',
      profile_intro:
        'Senior Product Designer, 10+ years, remote 6+ years, English C1. Portfolio: https://neolissa.github.io/polina-tsoy-designer/en/',
      achievements: [
        {
          lead: 'TVIP (two surfaces)',
          impact: 'admin + consumer across 5 platforms — personas, themes, coherent system.',
        },
        {
          lead: 'DocsBird (trust + conversion)',
          impact: 'international B2B onboarding clarity — registration 7→3, +45% conversion.',
        },
        {
          lead: 'Systems that scale discovery UX',
          impact: 'WUW reusable components/tokens so patterns stay consistent as surfaces grow.',
        },
      ],
      problems_section:
        'Honest stretch: marketplace ranking at consumer scale is newer for me than B2B/admin+consumer products. I transfer multi-audience IA, trust UX, and AI-assisted prototyping speed. Comp ask $75–90K geo-adjusted.',
      closing: 'Happy to discuss Discover tradeoffs and show relevant multi-audience cases.',
      footnotes: [
        { marker: 'Portfolio:', text: 'Cases', url: 'https://neolissa.github.io/polina-tsoy-designer/en/' },
      ],
    },
    formAnswers: `# Circle — Lead PD Marketplace — answers

**Apply:** https://jobs.ashbyhq.com/circle/b0bed2c6-d4c5-4e8e-b44d-7333372debbe

Stretch: marketplace hard-requirement — emphasize TVIP dual audience + DocsBird trust/conversion.
Comp $75–90K. Location Argentina remote worldwide.
EEO: Female / White / LGBTQIA No / Disability No.

«отправила» → Applied + \`sent/\`
`,
  },
  {
    slug: 'synthesia-ai-native',
    company: 'Synthesia',
    role: 'Product Designer, AI-Native Products',
    applyUrl: 'https://jobs.ashbyhq.com/synthesia/4721d2c3-3d94-45d3-b9f7-ea5e1f549ce2',
    geo: 'Europe · soft (already applied Growth — 2nd Synthesia role)',
    salaryAsk: '$75,000 USD (target $60–90K)',
    summarySwap:
      'Senior Product Designer for AI-native product surfaces — research-led UX, systems thinking, and comfort designing under ambiguity. 10+ years product design; 6+ years remote. Actively expanding AI-assisted prototyping. Soft-geo Europe role: based in Argentina, available async with EU overlap.',
    cover: {
      role_title: 'Product Designer, AI-Native Products',
      company: 'Synthesia',
      city: 'Remote · Europe (soft geo)',
      date: DATE,
      greeting: 'Dear Hiring Team,',
      opening:
        'Synthesia is shaping AI-native creation experiences — where interaction design must make powerful models feel simple and trustworthy. I am applying for the AI-Native Product Designer role to bring senior end-to-end craft to that problem space.',
      profile_intro:
        'Senior Product Designer, 10+ years, English C1, fully remote 6+ years. Portfolio: https://neolissa.github.io/polina-tsoy-designer/en/',
      achievements: [
        {
          lead: 'Ambiguity → shipped',
          impact: 'DocsBird 0→1 under unclear mandate — 4-country launch, +45% conversion.',
        },
        {
          lead: 'Systems for evolving products',
          impact: 'WUW design system — −90% styles, ×3 speed as the product surface grew.',
        },
        {
          lead: 'Complex multi-surface UX',
          impact: 'TVIP across 5 platforms with coherent personas and themes.',
        },
      ],
      problems_section:
        'Note: I previously applied to Product Designer, Growth at Synthesia — this AI-Native track is a different problem space I want specifically. Based in Argentina; can overlap EU hours. Comp ask $75K USD.',
      closing: 'Happy to share AI-tooling practice and relevant case studies.',
      footnotes: [
        { marker: 'Portfolio:', text: 'Cases', url: 'https://neolissa.github.io/polina-tsoy-designer/en/' },
      ],
    },
    formAnswers: `# Synthesia — AI-Native PD — answers

**Apply:** https://jobs.ashbyhq.com/synthesia/4721d2c3-3d94-45d3-b9f7-ea5e1f549ce2

Already applied Growth — this is a second, different role.
Location: Argentina; EU overlap OK.
Comp: $75K.
EEO defaults as locked.

«отправила» → Applied + \`sent/\`
`,
  },
  {
    slug: 'overflow-senior-pd',
    company: 'Overflow',
    role: 'Senior Product Designer',
    applyUrl: 'https://jobs.ashbyhq.com/overflow/a925ffca-219b-458f-94e5-9e4d97e8fcd5',
    geo: 'Remote · verify form (US benefits language — soft if form accepts AR)',
    salaryAsk: '$75,000 USD (target $60–90K)',
    summarySwap:
      'Senior Product Designer with 10+ years on trust-heavy, multi-step product flows — fintech-adjacent clarity, design systems, and end-to-end ownership. 6+ years fully remote. Excited about Overflow’s mission to make generosity easier across cash, stock, and crypto giving.',
    cover: {
      role_title: 'Senior Product Designer',
      company: 'Overflow',
      city: 'Remote',
      date: DATE,
      greeting: 'Dear Hiring Team,',
      opening:
        'Overflow is building giving infrastructure for high-impact organizations — trust, clarity, and multi-rail payments (cash, stock, crypto). I am applying as Senior Product Designer because my strongest work is high-stakes, multi-step UX where craft and systems keep complexity usable.',
      profile_intro:
        'Senior Product Designer, 10+ years, English C1, remote 6+ years. Based in Argentina. Portfolio: https://neolissa.github.io/polina-tsoy-designer/en/',
      achievements: [
        {
          lead: 'Trust & conversion',
          impact: 'DocsBird international onboarding — 7→3 steps, +45% conversion.',
        },
        {
          lead: 'Fintech-adjacent money surfaces',
          impact: 'Relaunch personal account / ecosystem — ×4 session time, 100% adoption.',
        },
        {
          lead: 'Systems',
          impact: 'WUW reusable system — −90% styles, ×3 speed.',
        },
      ],
      problems_section:
        'Comfortable with crypto rails as a domain. Comp ask $75K USD. If the role is US-work-auth hard-locked, please say so early — I am Argentina-based remote.',
      closing: 'Happy to walk through trust/fintech-adjacent cases.',
      footnotes: [
        { marker: 'Portfolio:', text: 'Cases', url: 'https://neolissa.github.io/polina-tsoy-designer/en/' },
      ],
    },
    formAnswers: `# Overflow — Senior Product Designer — answers

**Apply:** https://jobs.ashbyhq.com/overflow/a925ffca-219b-458f-94e5-9e4d97e8fcd5

If form requires US work authorization → stop / skip (hard geo).
Else: Argentina remote, Yes eligible framing, Require Sponsorship if forced.
Comp $75K. Crypto OK. EEO defaults.

«отправила» → Applied + \`sent/\`
`,
  },
];

function tweakHtml(summary) {
  // Replace first professional summary paragraph content heuristically
  return baseHtml.replace(
    /(<div class="summary-text">)([\s\S]*?)(<\/div>)/,
    `$1${summary}$3`
  );
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
**Date:** 2026-07-20
**Geo:** ${p.geo}
**Comp ask:** ${p.salaryAsk}

## Files
- \`cv-polina-tsoy-${p.slug}.pdf\`
- \`cover-polina-tsoy-${p.slug}.pdf\`
- \`cover.txt\`
- \`FORM-ANSWERS.md\`

## Next step
1. Upload CV (+ cover if ATS has upload)
2. Use FORM-ANSWERS
3. Polina Submit — do not auto-submit
`
  );

  const pdfPath = join(dir, `cv-polina-tsoy-${p.slug}.pdf`);
  let r = spawnSync('node', [join(ROOT, 'generate-pdf.mjs'), htmlPath, pdfPath, '--format=a4'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  console.log('CV', p.slug, r.status, (r.stderr || r.stdout || '').slice(-200));

  r = spawnSync('node', [join(ROOT, 'generate-cover-letter.mjs'), '--payload', join(dir, 'cover-payload.json')], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  // move cover from output/ root if needed
  const flat = join(ROOT, 'output', `cover-polina-tsoy-${p.slug}.pdf`);
  const nested = join(dir, `cover-polina-tsoy-${p.slug}.pdf`);
  if (existsSync(flat) && flat !== nested) {
    copyFileSync(flat, nested);
  }
  console.log('COVER', p.slug, r.status, (r.stderr || r.stdout || '').slice(-200));
}

console.log('Done', packs.map((p) => p.slug).join(', '));
