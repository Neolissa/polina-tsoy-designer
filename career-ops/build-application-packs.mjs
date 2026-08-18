#!/usr/bin/env node
/**
 * One-shot builder: tailored CV HTML + cover payloads + apply guides for Polina's priority apps.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'output', 'applications');
mkdirSync(OUT, { recursive: true });

const DATE = '2026-07-13';
const template = readFileSync(join(ROOT, 'templates', 'cv-template.html'), 'utf8');

const contact = {
  NAME: 'Polina Tsoy',
  PHONE: '+79525364225',
  EMAIL: 'neolissa@gmail.com',
  LINKEDIN_URL: 'https://neolissa.github.io/polina-tsoy-designer/en/',
  LINKEDIN_DISPLAY: 'Portfolio',
  PORTFOLIO_URL: 'https://neolissa.github.io/polina-tsoy-designer/en/',
  PORTFOLIO_DISPLAY: 'neolissa.github.io/polina-tsoy-designer',
  LOCATION: 'Remote worldwide (relocating to Argentina)',
};

const education = `
<div class="edu-item">
  <div class="edu-header">
    <span class="edu-school">Orel State Institute of Economics and Trade</span>
    <span class="edu-year">2018</span>
  </div>
  <div class="edu-degree">Higher education — Faculty of Business and Advertising (Advertising &amp; PR)</div>
</div>`;

const certifications = `
<div class="cert-row"><span class="cert-name">Erickson Coaching International — Coaching</span><span class="cert-year">2023</span></div>
<div class="cert-row"><span class="cert-name">Skill Factory — Agile facilitation</span><span class="cert-year">2018</span></div>
<div class="cert-row"><span class="cert-name">ScrumTrek / Finnplay — Certified Agile Team Facilitator</span><span class="cert-year">2018</span></div>
<div class="cert-row"><span class="cert-name">Skillbox — UI/UX Designer</span><span class="cert-year">2018</span></div>`;

const skillsBase = `
<div class="skill-row"><span class="skill-category">Research</span> UX research, CustDev, interviews, corridor testing, CJM, User Flow, JTBD, metrics &amp; click maps, A/B testing</div>
<div class="skill-row"><span class="skill-category">Design</span> Figma, UI kits / design systems, tokens, interactive prototyping, product design, web &amp; mobile, motion</div>
<div class="skill-row"><span class="skill-category">Process</span> End-to-end ownership, Jira, design review, mentoring, Agile/Scrum, MVP, cross-functional delivery</div>
<div class="skill-row"><span class="skill-category">Tech literacy</span> HTML/CSS; comfortable partnering with engineering on buildable UI</div>
<div class="skill-row"><span class="skill-category">Languages</span> Russian (native), English (C1)</div>`;

function competencies(tags) {
  return tags.map(t => `<span class="competency-tag">${t}</span>`).join('\n      ');
}

function job({ company, role, period, location, bullets }) {
  return `
<div class="job">
  <div class="job-header">
    <span class="job-company">${company}</span>
    <span class="job-period">${period}</span>
  </div>
  <div class="job-role">${role}</div>
  ${location ? `<div class="job-location">${location}</div>` : ''}
  <ul>
    ${bullets.map(b => `<li>${b}</li>`).join('\n    ')}
  </ul>
</div>`;
}

function projects(items) {
  return items.map(p => `
<div class="project">
  <div class="project-header">
    <span class="project-title">${p.title}</span>
    ${p.badge ? `<span class="project-badge">${p.badge}</span>` : ''}
  </div>
  <div class="project-desc">${p.desc}</div>
</div>`).join('\n');
}

function fillCv({ summary, comps, experience, projectItems, skillsExtra = '' }) {
  let html = template;
  const map = {
    '{{LANG}}': 'en',
    '{{PAGE_WIDTH}}': '210mm',
    '{{PHOTO}}': '',
    '{{NAME}}': contact.NAME,
    '{{PHONE}}': contact.PHONE,
    '{{EMAIL}}': contact.EMAIL,
    '{{LINKEDIN_URL}}': contact.LINKEDIN_URL,
    '{{LINKEDIN_DISPLAY}}': contact.LINKEDIN_DISPLAY,
    '{{PORTFOLIO_URL}}': contact.PORTFOLIO_URL,
    '{{PORTFOLIO_DISPLAY}}': contact.PORTFOLIO_DISPLAY,
    '{{LOCATION}}': contact.LOCATION,
    '{{SECTION_SUMMARY}}': 'Professional Summary',
    '{{SUMMARY_TEXT}}': summary,
    '{{SECTION_COMPETENCIES}}': 'Core Competencies',
    '{{COMPETENCIES}}': competencies(comps),
    '{{SECTION_EXPERIENCE}}': 'Work Experience',
    '{{EXPERIENCE}}': experience,
    '{{SECTION_PROJECTS}}': 'Selected Case Studies',
    '{{PROJECTS}}': projects(projectItems),
    '{{SECTION_EDUCATION}}': 'Education',
    '{{EDUCATION}}': education,
    '{{SECTION_CERTIFICATIONS}}': 'Certifications',
    '{{CERTIFICATIONS}}': certifications,
    '{{SECTION_SKILLS}}': 'Skills',
    '{{SKILLS}}': skillsBase + skillsExtra,
  };
  for (const [k, v] of Object.entries(map)) html = html.split(k).join(v);
  return html;
}

// Shared experience blocks with emphasis variants
const expRemote = [
  job({
    company: 'Ediweb',
    role: 'Product Designer — International Products',
    period: 'Feb 2024 — Jan 2026',
    location: 'Remote · International B2B',
    bullets: [
      'Owned end-to-end product design for international B2B flows — from hypothesis and research to staging validation and handoff.',
      'Built and evolved a shared international UI kit across multiple products, improving consistency and speeding feature delivery.',
      'Led DocsBird from planning to MVP: scenarios, UI, hypothesis tests, stakeholder demos — launch in 4 countries; registration 7→3 steps; +45% conversion.',
      'Partnered with distributed PMs, analysts, and engineers in Agile/Jira; defended design decisions with evidence, not taste.',
    ],
  }),
  job({
    company: 'Ruxsoft',
    role: 'Product Designer',
    period: 'Dec 2021 — Feb 2024',
    location: 'Remote',
    bullets: [
      'Ran full-cycle product design: research (corridor, qualitative, quantitative), CJM/User Flows, roadmaps, UI, and design reviews.',
      'Scaled design systems and White Label kits — enabling commercialization and faster client instances.',
      'Mentored junior designers; optimized handoff so design sits inside the delivery loop, not beside it.',
      'Key outcomes on coaching and internal platforms: −90% styles / ×3 delivery speed (WUW); ×4 session time / +40% engagement / 100% adoption (Relaunch).',
    ],
  }),
  job({
    company: 'TVIP',
    role: 'UX/UI Designer',
    period: 'Apr 2020 — Nov 2021',
    location: 'Saint Petersburg',
    bullets: [
      'Designed complex multi-platform media product UX: admin, desktop, and mobile — logic, navigation, and visual system.',
      'Profile system for 4 personas, day/night themes, UI kit for 5 platforms; close collaboration with engineering through implementation QA.',
    ],
  }),
  job({
    company: 'Earlier roles (Tizbi, Finnplay, Corex, Fenice)',
    role: 'UX/UI & Web Designer',
    period: '2015 — 2020',
    bullets: [
      'Built English-language web/mobile products, White Label UI kits, Agile delivery, and data-informed site optimization (Analytics, click maps).',
    ],
  }),
];

const casesB2B = [
  { title: 'DocsBird', badge: 'International B2B', desc: 'Lead Product Designer — document management for Europe & Baltics. Design system + brand; registration 7→3 steps; +45% conversion; launch in 4 countries.' },
  { title: 'Relaunch (Relax.coin)', badge: 'Internal platform', desc: 'Lead PD — unified ecosystem replacing 5+ tools; DS 50+ components; ×4 session time, +40% engagement, 60% mobile, 100% adoption.' },
  { title: 'WakeupWarrior', badge: 'Design system', desc: 'Lead PD — evolutionary refactor: 35 components, tokens, constructor covering ~80% of UI; −90% styles, ×3 development speed, White Label enabled.' },
  { title: 'TVIP', badge: 'Multi-platform', desc: 'Product Designer — IP/TV across 5 platforms with personas and day/night themes; admin + consumer surfaces.' },
];

const packages = [
  {
    slug: 'remotecom-senior-pd',
    report: '009',
    company: 'Remote.com',
    role: 'Senior Product Designer',
    url: 'https://job-boards.greenhouse.io/remotecom/jobs/7762220003',
    applyUrl: 'https://job-boards.greenhouse.io/remotecom/jobs/7762220003',
    salaryAsk: '$75,000 USD (within stated $60–168K band; open to total package discussion)',
    summary: 'Senior Product Designer with 10+ years shipping complex B2B SaaS — research-led, systems-minded, and proven in fully remote teams (6+ years). I turn ambiguous product problems into clear end-to-end experiences and durable design systems. Looking to help Remote scale global employment UX where design influences strategy, not only screens.',
    comps: ['B2B SaaS product design', 'End-to-end design process', 'Design systems', 'User research', 'Systems thinking', 'Cross-functional collaboration', 'Async remote', 'HRTech / FinTech-ready'],
    experience: expRemote.join('\n'),
    projects: casesB2B,
    cover: {
      role_title: 'Senior Product Designer',
      company: 'Remote',
      city: 'Remote · Anywhere',
      date: '13 July 2026',
      greeting: 'Dear Hiring Team,',
      opening: 'Remote is building the infrastructure for hiring and paying people anywhere — and that ambition needs designers who treat complexity as a product problem, not a UI polish task. I am applying for the Senior Product Designer role because my work sits exactly there: research, systems, and measurable outcomes across international B2B products.',
      profile_intro: 'I am a Senior Product Designer with 10+ years in product development and 6+ years fully remote. English C1. Portfolio: https://neolissa.github.io/polina-tsoy-designer/en/',
      achievements: [
        { lead: 'On DocsBird', impact: 'I led design from planning to MVP for an international document product — 4-country launch, registration cut from 7 to 3 steps, +45% conversion.' },
        { lead: 'On Relaunch', impact: 'I unified a fragmented employee platform (25+ functions, 50+ component system) and helped drive ×4 session time, +40% engagement, and 100% adoption.' },
        { lead: 'On WakeupWarrior', impact: 'I rebuilt the interface as a system (35 components, tokens) — −90% styles, ×3 development speed, White Label unlocked.' },
      ],
      problems_section: 'Remote customers need clarity under regulatory and operational complexity. I would bring the same approach I used on DocsBird and financial/reporting UIs: map the real jobs-to-be-done, reduce step friction, and keep a design system that lets product teams ship without reinventing patterns.',
      closing: 'I am available fully remote worldwide (relocating to Argentina) and can start on a short notice period. Happy to walk through case studies or a working session with your team.',
      footnotes: [
        { marker: 'Portfolio:', text: 'Selected cases', url: 'https://neolissa.github.io/polina-tsoy-designer/en/' },
      ],
    },
    formAnswers: {
      'Authorized to work / location': 'Yes — seeking fully remote employment worldwide. Relocating to Argentina; currently able to work remotely. Prefer employee or contractor via EOR where needed. No US visa sponsorship required for a worldwide remote role.',
      'Salary expectation': '$75,000 USD base (flexible within Remote geo bands; target total package aligned with Senior PD scope). Floor $24K; target band $60–90K.',
      'Notice period': '14 days (or as agreed).',
      'How did you hear': 'Company careers / Greenhouse.',
      'Why Remote': 'Remote operationalizes “hire anyone, anywhere” — the same problem space I enjoy in international B2B products: trust, clarity under complexity, and systems that scale across markets.',
      'Remote experience': '6+ years fully remote collaboration with distributed PMs, engineers, and analysts.',
    },
  },
  {
    slug: 'remotecom-staff-pay',
    report: '012',
    company: 'Remote.com',
    role: 'Staff Product Designer, Pay Ecosystem',
    url: 'https://job-boards.greenhouse.io/remotecom/jobs/7500346003',
    applyUrl: 'https://job-boards.greenhouse.io/remotecom/jobs/7500346003',
    salaryAsk: '$85,000 USD (within stated $70.7–159K band)',
    summary: 'Staff-shaped Product Designer specializing in complex, data-heavy B2B experiences — financial reporting, international flows, and design systems that unlock speed. 10+ years product design, 6+ years remote. I connect research, systems thinking, and cross-functional delivery to ship pay-adjacent clarity at scale.',
    comps: ['Staff product design', 'Payroll / pay UX readiness', 'Complex data UIs', 'Design systems', 'B2B SaaS', 'Research & metrics', 'Systems thinking', 'Global remote'],
    experience: expRemote.join('\n'),
    projects: [
      casesB2B[1], casesB2B[0], casesB2B[2], casesB2B[3],
    ],
    cover: {
      role_title: 'Staff Product Designer, Pay Ecosystem',
      company: 'Remote',
      city: 'Remote · Anywhere',
      date: '13 July 2026',
      greeting: 'Dear Hiring Team,',
      opening: 'Paying people correctly across borders is a high-stakes UX problem: dense data, trust, and edge cases that break naive flows. I am applying for Staff Product Designer, Pay Ecosystem because my strongest work is exactly this class of product — financial reporting UIs, international B2B launches, and systems that keep teams shipping.',
      profile_intro: 'Senior/Staff Product Designer with measurable ownership on complex platforms. English C1. Fully remote for 6+ years. Portfolio: https://neolissa.github.io/polina-tsoy-designer/en/',
      achievements: [
        { lead: 'Financial / employee money surfaces', impact: 'On Relaunch (Relax.coin) I designed a data-heavy personal account and ecosystem that reached ×4 session time and 100% adoption.' },
        { lead: 'International trust & conversion', impact: 'DocsBird: 4-country launch under constraints; registration 7→3 steps; +45% conversion.' },
        { lead: 'Systems leverage', impact: 'WUW design system: −90% styles, ×3 speed, White Label — the kind of leverage a pay ecosystem needs to stay consistent.' },
      ],
      problems_section: 'I would focus on making payroll and pay journeys legible for customers under ambiguity: progressive disclosure for dense data, reusable patterns in the design system, and research loops that catch failure modes before they hit support.',
      closing: 'Open to Staff-scope ownership as an IC. Fully remote worldwide; short notice period. Glad to share deep dives on the financial and international cases.',
      footnotes: [
        { marker: 'Portfolio:', text: 'Cases', url: 'https://neolissa.github.io/polina-tsoy-designer/en/' },
      ],
    },
    formAnswers: {
      'Authorized to work / location': 'Fully remote worldwide (JD: Anywhere in the world). Relocating to Argentina. EOR/employee arrangements welcome.',
      'Salary expectation': '$85,000 USD base within $70.7–159K band; open on total rewards.',
      'Notice period': '14 days.',
      'Why this role': 'Pay ecosystem combines systems design with high-consequence UX — my strongest match vs pure marketing/consumer screens.',
      'Staff readiness': 'I operate as a senior IC who owns outcomes end-to-end, mentors juniors, and influences roadmap — without needing a people-manager seat.',
    },
  },
  {
    slug: 'rwazi-senior-pd',
    report: '011',
    company: 'Rwazi',
    role: 'Senior Product Designer (Sena)',
    url: 'https://jobs.ashbyhq.com/rwazi/4fa4cdca-8c88-4aab-ab58-97c836f29038',
    applyUrl: 'https://jobs.ashbyhq.com/rwazi/4fa4cdca-8c88-4aab-ab58-97c836f29038/application',
    salaryAsk: '$70,000–$90,000 USD (negotiable; target band)',
    summary: 'Senior Product Designer for data-rich B2B products — enterprise dashboards, reporting, and research-driven flows. 10+ years designing complex systems (fintech, healthcare, media). HTML/CSS literate; actively expanding AI-assisted prototyping. Seeking a global remote role owning Sena-class intelligence UX end-to-end.',
    comps: ['Enterprise B2B SaaS', 'Data visualization', 'Dashboards & reporting', 'User research', 'Design systems', 'HTML/CSS', 'Product thinking', 'Global remote'],
    experience: expRemote.join('\n'),
    projects: casesB2B,
    skillsExtra: `<div class="skill-row"><span class="skill-category">AI tooling</span> Actively learning AI-assisted prototyping/coding (Claude Code and peers); already ship with HTML/CSS literacy alongside engineering</div>`,
    cover: {
      role_title: 'Senior Product Designer — Sena',
      company: 'Rwazi',
      city: 'Global Remote',
      date: '13 July 2026',
      greeting: 'Dear Rwazi Hiring Team,',
      opening: 'Sena sits at the hard part of product design: turning dense, multi-dimensional consumer intelligence into something enterprise users can trust and act on. I am applying because that is the work I do best — data-heavy B2B interfaces, research, and systems that scale.',
      profile_intro: 'Senior Product Designer, 10+ years, English C1, fully remote 6+ years. Portfolio: https://neolissa.github.io/polina-tsoy-designer/en/',
      achievements: [
        { lead: 'Dense data → clarity', impact: 'Financial reporting and admin-scale products (Relaunch, Medica+, TVIP admin) where hierarchy and progressive disclosure matter.' },
        { lead: 'Adoption metrics', impact: 'Relaunch: ×4 session time, +40% engagement, 100% adoption after unifying fragmented tools.' },
        { lead: '0→1 under constraints', impact: 'DocsBird international launch with +45% conversion after simplifying critical flows.' },
      ],
      problems_section: 'Honest note on AI-assisted build: I am fluent in Figma and HTML/CSS and already partner tightly with engineering; I am actively building daily muscle with AI coding tools rather than claiming years of Claude Code production history. I learn tools fast when they are core to how the team ships.',
      closing: 'Excited about a small senior design team with direct product/eng collaboration. Available worldwide remote.',
      footnotes: [
        { marker: 'Portfolio:', text: 'Cases', url: 'https://neolissa.github.io/polina-tsoy-designer/en/' },
      ],
    },
    formAnswers: {
      'Location': 'Global remote — Argentina-bound; timezone-flexible.',
      'Salary': '$70–90K USD target; flexible for strong equity/total package.',
      'AI / Claude Code': 'HTML/CSS yes; AI-assisted coding in active practice — transparent and willing to demonstrate a small build.',
      'Why Rwazi': 'Enterprise intelligence UX + design-to-code culture matches how I already work with engineers.',
    },
  },
  {
    slug: 'hyphen-lead-pd-crypto',
    report: '013',
    company: 'Hyphen Connect (DEX client)',
    role: 'Lead Product Designer (Crypto Exchange)',
    url: 'https://weworkremotely.com/remote-jobs/hyphen-connect-limited-lead-product-designer-crypto-exchange',
    applyUrl: 'https://weworkremotely.com/remote-jobs/hyphen-connect-limited-lead-product-designer-crypto-exchange',
    salaryAsk: '$80,000–$90,000 USD (or equivalent; ask client band)',
    summary: 'Lead Product Designer with deep design-systems ownership and cross-platform craft (iOS, Android, web). 10+ years product design; built reusable component systems and White Label kits that cut delivery time dramatically. Comfortable leading design on complex, high-stakes multi-surface products — including fintech-adjacent and crypto-friendly domains.',
    comps: ['Lead product design', 'Design systems / DLS', 'Cross-platform UI', 'Figma libraries & tokens', 'Stakeholder management', 'Accessibility', 'Fintech / crypto-ready', 'Remote leadership'],
    experience: expRemote.join('\n'),
    projects: [casesB2B[2], casesB2B[3], casesB2B[0], casesB2B[1]],
    cover: {
      role_title: 'Lead Product Designer (Crypto Exchange)',
      company: 'Hyphen Connect / Client',
      city: 'Remote · Anywhere',
      date: '13 July 2026',
      greeting: 'Dear Hiring Team,',
      opening: 'I am interested in the Lead Product Designer role for your decentralised exchange client. High-trust trading UX needs the same foundations I have shipped before: a coherent design language system, pixel-disciplined multi-platform UI, and research that keeps complexity usable.',
      profile_intro: 'Lead/Senior Product Designer, 10+ years, design systems specialist, English C1, worldwide remote. Portfolio: https://neolissa.github.io/polina-tsoy-designer/en/',
      achievements: [
        { lead: 'Design Language System at scale', impact: 'WUW: 35 reusable components + tokens; constructor covering ~80% of UI; −90% styles; ×3 speed; White Label opened.' },
        { lead: 'Cross-platform systems', impact: 'TVIP: UI kit and coherent experience across 5 platforms with personas and themes.' },
        { lead: 'Fintech-adjacent complexity', impact: 'Financial reporting accounts and international B2B launches (Relaunch, DocsBird) where clarity and trust matter.' },
      ],
      problems_section: 'I am comfortable with crypto as a domain. Please share the client company name and compensation band when possible — I apply carefully and prefer a direct line to the product team once screening clears.',
      closing: 'Available fully remote worldwide. Happy to present a design-system case and a multi-platform walkthrough.',
      footnotes: [
        { marker: 'Portfolio:', text: 'WUW / TVIP / DocsBird', url: 'https://neolissa.github.io/polina-tsoy-designer/en/' },
      ],
    },
    formAnswers: {
      'Crypto OK': 'Yes.',
      'Location': 'Anywhere in the world / remote.',
      'Salary': '$80–90K USD target; open to client band.',
      'Leadership': 'Lead IC + mentoring; design reviews; systems ownership — confirm if role includes people management headcount.',
      'Ask recruiter': 'Client company name; equity vs cash; interview process.',
    },
  },
];

const candidateBlock = {
  name: 'Polina Tsoy',
  email: 'neolissa@gmail.com',
  phone: '+79525364225',
  location: 'Remote worldwide (Argentina-bound)',
  credentials: ['Senior Product Designer', 'English C1', '10+ years'],
};

for (const pkg of packages) {
  const dir = join(OUT, pkg.slug);
  mkdirSync(dir, { recursive: true });

  const html = fillCv({
    summary: pkg.summary,
    comps: pkg.comps,
    experience: pkg.experience,
    projectItems: pkg.projects,
    skillsExtra: pkg.skillsExtra || '',
  });
  const htmlPath = join(dir, `cv-polina-tsoy-${pkg.slug}.html`);
  writeFileSync(htmlPath, html);

  const coverPayload = {
    candidate: candidateBlock,
    letter: pkg.cover,
    output_path: join(dir, `cover-polina-tsoy-${pkg.slug}.pdf`),
  };
  const payloadPath = join(dir, 'cover-payload.json');
  writeFileSync(payloadPath, JSON.stringify(coverPayload, null, 2));

  // Plain-text cover for ATS paste
  const ach = pkg.cover.achievements.map(a => `• ${a.lead}, ${a.impact}`).join('\n');
  const coverTxt = `${pkg.cover.greeting}

${pkg.cover.opening}

${pkg.cover.profile_intro}

${ach}

${pkg.cover.problems_section}

${pkg.cover.closing}

Polina Tsoy
${contact.EMAIL} | ${contact.PHONE}
${contact.PORTFOLIO_URL}
`;
  writeFileSync(join(dir, 'cover.txt'), coverTxt);

  const guide = `# Application pack — ${pkg.company} — ${pkg.role}

**Report:** #${pkg.report}
**JD:** ${pkg.url}
**Apply:** ${pkg.applyUrl}
**Date:** ${DATE}

## Files
- \`cv-polina-tsoy-${pkg.slug}.html\` → PDF below
- \`cv-polina-tsoy-${pkg.slug}-${DATE}.pdf\` (after generate)
- \`cover-polina-tsoy-${pkg.slug}.pdf\`
- \`cover.txt\` (paste into forms)

## Suggested salary answer
${pkg.salaryAsk}

## Form answers (draft — review before submit)

${Object.entries(pkg.formAnswers).map(([k, v]) => `### ${k}\n${v}`).join('\n\n')}

## Knock-out watchlist
- Work authorization / country eligibility — answer **worldwide remote**, not US work auth unless asked for US entity.
- Salary — stay inside JD band when stated; otherwise use suggested ask above.
- Do **not** auto-submit — review PDF + answers first.

## Next step
1. Open apply URL
2. Upload CV PDF + paste cover.txt where needed
3. Use form answers above
`;
  writeFileSync(join(dir, 'APPLY.md'), guide);

  // Generate PDFs
  const env = { ...process.env, PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || '/home/polina/.cache/ms-playwright' };
  const pdfPath = join(dir, `cv-polina-tsoy-${pkg.slug}-${DATE}.pdf`);
  console.log('PDF CV', pkg.slug);
  let r = spawnSync('node', [join(ROOT, 'generate-pdf.mjs'), htmlPath, pdfPath, '--format=a4', `--report=${pkg.report}`], { cwd: ROOT, env, encoding: 'utf8' });
  console.log(r.stdout || '');
  if (r.status !== 0) console.error(r.stderr);

  console.log('PDF Cover', pkg.slug);
  r = spawnSync('node', [join(ROOT, 'generate-cover-letter.mjs'), '--payload', payloadPath], { cwd: ROOT, env, encoding: 'utf8' });
  console.log(r.stdout || '');
  if (r.status !== 0) console.error(r.stderr);

  // prepare-application for greenhouse/ashby only
  if (/greenhouse\.io|ashbyhq\.com/.test(pkg.applyUrl) && existsSync(pdfPath)) {
    console.log('Prefill', pkg.slug);
    r = spawnSync('node', [join(ROOT, 'prepare-application.mjs'), '--url', pkg.applyUrl, '--pdf', pdfPath, '--cover', join(dir, 'cover.txt')], { cwd: ROOT, env, encoding: 'utf8' });
    writeFileSync(join(dir, 'prefill-summary.txt'), (r.stdout || '') + (r.stderr || ''));
    console.log(r.stdout || '');
  }
}

console.log('\\nDone. Packages in', OUT);
