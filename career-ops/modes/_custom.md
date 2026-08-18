# Custom Instructions -- career-ops

## House Rules

- Communicate with Polina in **Russian**; generate application materials (CV PDF, cover letters, outreach) in the **language of the JD** (usually English).
- Never invent metrics or titles not present in `cv.md` / `article-digest.md` / `config/profile.yml`.
- Prefer EN portfolio URLs for English applications.
- Cap batch runs at 20 listings unless asked otherwise.
- If a report scores below 6/10 (or equivalent weak fit), skip auto cover letter unless Polina asks.
- Telegram handle for contact: **@ewersawers** (not ewersavers).
- **Crypto / Web3 is OK** (confirmed 2026-07-13) — do not auto-skip crypto roles.
- **We Work Remotely (WWR) — skip** (confirmed 2026-07-20): site paywalled apply flow; do not queue or apply to `weworkremotely.com` listings. Prefer company ATS / Greenhouse / Ashby / SmartRecruiters direct. If the same role appears on WWR and a free ATS, use the ATS URL only.
- **Application packs layout** (confirmed 2026-07-20): after Polina submits, move the pack folder from `output/applications/<slug>/` → `output/applications/sent/<slug>/`. Keep only in-progress / next-to-apply packs in `applications/` root.

### Geo apply rule (confirmed 2026-07-17)

- **Hard geo lock** (explicit country list / “UK/EU only” / no EOR path for AR) → **do not apply**.
- **Not hard-locked** (Europe preferred, remote-friendly for region, form still accepts Location + sponsorship) → **full proper application** (custom CV PDF + form answers + cover if useful). No “light apply” on soft-geo roles — weak packets waste the only chance a human might override location preference.

## Locked form answers (do not re-ask)

Confirmed with Polina 2026-07-17. Use these by default when filling ATS forms:

| Topic | Answer |
|-------|--------|
| Pronouns | she/her |
| Non-compete | No |
| Race/Ethnicity | White (Not Hispanic or Latino) |
| Gender / Gender identity | Female / Woman — identifies as a woman (confirmed 2026-07-20) |
| LGBTQIA+ / sexual orientation | No — does not identify as LGBTQIA+; prefer Heterosexual/Straight or equivalent if asked (confirmed 2026-07-20) |
| Transgender | No |
| Disability | No — no disability, no chronic conditions/disorders for form purposes (confirmed 2026-07-20) |
| Veteran | No / I am not a protected veteran |
| EEO / demographic consent | Yes, I consent (+ checkbox) |
| BrightHire / interview recording AI | Yes |
| Privacy notice | Acknowledge / Confirm |
| How did you hear (if no better match) | Other |
| Portfolio | https://neolissa.github.io/polina-tsoy-designer/en/ (no password) |
| Comp ask (when band allows) | $75,000 USD base; floor $24K; target $60–90K |

### Argentina legal status (critical — do not invent)

- Physically based in Argentina (small town near Buenos Aires).
- Russian citizenship. **Current Argentina status: tourist. No Argentine citizenship / PМЖ / work visa yet.**
- Path to Argentine residency (ВНЖ): typically needs **proven foreign income** (rentista-style) — that is why she seeks **international remote** work, not an Argentina-local employer.
- **User preference (2026-07-17):** for Remote.com-style forms, answer **Yes** to “legally eligible to work in the country where you plan to work from” — Polina’s framing: she can work remotely from Argentina for an international employer while physically there as a tourist.
- Second status dropdown (Citizen/PR | Work VISA | Require Sponsorship | Refugee): **none match tourist**. Do **not** pick Citizen/PR or Work VISA (false). Refugee = no. If Yes forces a status pick → use **Require Sponsorship** as least-wrong (signals: not yet locally authorized as employee/resident; employer/EOR setup needed). This is a form compromise, not a claim that she wants a classic Argentina work-visa petition as her life plan.
- Still never invent papers she does not have.

## Custom Workflows

(none yet)

## Output Preferences

- Reports: lead with score and one-line verdict in Russian for Polina.
- Explain technical jargon briefly when it affects a decision (UX specialist, not engineer).

### CV / PDF naming & content (confirmed 2026-07-17)

- **Do not shorten** the job title or company name in CV content, pack folders, or filenames when space allows — use the full role title and company as in the JD/tracker (e.g. `Staff Product Designer, Pay Ecosystem`, `Remote.com`), not abbreviations like `staff-pay` / `remotecom` alone.
- **OK to omit creation dates** from CV filenames and from CV document headers (no `2026-07-13` in the PDF name / on-page “generated on” lines). Work-experience dates stay.
- **Cover letters → always PDF** (confirmed 2026-07-17). Build via `generate-cover-letter.mjs` from a `cover-payload.json`; keep `cover.txt` only as editable source / paste-fallback. Many ATS (Ashby, Greenhouse) accept Cover Letter as file upload, so a PDF must exist. Note: the script writes to `output/` root with a flat filename — move the PDF into the application folder after generating.

### CV impact hierarchy (confirmed 2026-07-23)

- Put 3–4 source-backed proof points in the top third of the main and tailored CV. Prefer a compact `Selected Impact` block after the summary, or place the same evidence directly in the first screen when the target template has no separate block.
- Lead the two most recent roles with outcomes and confirmed scale context. Put responsibility/process bullets after measurable results.
- Make company/product context legible when confirmed in `cv.md` or `article-digest.md`: B2B/B2C, product type, markets, users, platforms, or launch stage. Never infer funding stage, team size, revenue, or headcount.
- Treat generic rejection templates as weak signals. Improve scanability without claiming that any listed reason caused the rejection.

## Off-Limits

- Never auto-submit an application.
- Never recommend Russia-only roles with exit/remote-abroad restrictions.
- Never edit system-layer files for personalization — use `_profile.md` / `_custom.md` / `profile.yml`.
