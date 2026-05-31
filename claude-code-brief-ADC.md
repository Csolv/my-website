# Claude Code Brief — ADC website (`my-website`)

You have this repo locally. Make the edits below to the **hand-coded static site**. This is a **visual mockup** that mirrors what we'll later rebuild on Squarespace — so **do NOT wire up real payments, real form backends, or real email**. Front-end mockups only; existing mock handlers stay mock.

## Ground rules (read first)
- **Match the existing design system.** Use the CSS variables already in `styles.css`: `--black #0d0d0d`, `--white`, `--green #2bad6d`, `--green-dark #1f9059`, `--green-pale #e8f8ef`, `--light #f5f5f5`, `--gray #6b6b6b`, `--border #e0e0e0`, `--radius 8px`; fonts `--font-h` (League Spartan, headings) and `--font-b` (Inter, body). Reuse existing classes — `.section`, `.section-inner`, `.section--light/--dark/--green`, `.section-label`, `.section-divider`, `.sub-heading`, `.body-text`, `.impact-cards`, `.impact-card`, `.donate-form-card`, `.amount-selector`, `.amount-btn`, `.form-group`, `.stats-grid`, `.t-bar-wrap`, `.t-bar`, `.btn.btn--primary`, `.reveal`. New sections must look native to the site.
- **Placeholders:** for any value that isn't final, wrap a tag using the existing `.placeholder-tag` style. **First move that rule out of the inline `<style>` block in `faq.html` (around line 71) into `styles.css`** so every page can use it, then reference it site-wide.
- **Keep all copy in Spanish**, matching the existing tone.
- **Do NOT add any tax-deductibility language anywhere** (legal/litigation reason). **Do NOT introduce any "registrada"/"registered" claim.**
- **Leave the `/admin` folder and `admin.js` completely untouched** (internal tooling, not public).
- Keep "nonprofit" / "sin fines de lucro" wording everywhere it currently appears **except** the two registration claims called out below.

---

## PART A — Remove the "registered nonprofit" claims (surgical)

**A1. `donar.html`** — the trust line under the donation form (~line 203).
- Find: `🔒 Transacción segura · ADC es una organización sin fines de lucro registrada en Panamá.`
- Replace with: `🔒 Transacción segura · ADC es una organización sin fines de lucro.`
- (Optional stronger version if you prefer impact framing: `🔒 Transacción segura · El 100% de tu donación apoya directamente a los jóvenes de Curundú.`)

**A2. `faq.html`** — the registration FAQ item (~lines 275 and 279).
- Question — Find: `¿ADC es una organización sin fines de lucro registrada?` → Replace: `¿ADC es una organización sin fines de lucro?`
- Answer — Find: `Sí. ADC es una organización sin fines de lucro fundada en 2014 y registrada en Panamá. <span class="placeholder-tag">PENDIENTE</span> <em style="margin-left:0.5rem;">Agregar número de registro oficial si disponible.</em>`
- Replace with: `Sí. ADC es una organización sin fines de lucro fundada en 2014 en el barrio de Curundú, Ciudad de Panamá. Todo el financiamiento se destina directamente a los programas de deporte, educación y nutrición para los jóvenes de la comunidad.`

**A3. Leave as-is** (per decision to keep general nonprofit wording): all footers (`Organización sin fines de lucro · …`), meta descriptions/keywords/JSON-LD, the `donar.html` "100% sin fines de lucro" line (~line 124) and the "Sin fines de lucro" stat (~line 249), and `chatbot.js`.

**A4. Verify:** after A1–A2, `grep -rni "registrad" --include=*.html .` should return **nothing outside `/admin`**.

---

## PART B — Add the visual mockup sections

### B1. Lead with monthly giving — `donar.html` donation form
- In the `Tipo de donación` `<select>` (~lines 188–194), reorder so **`Mensual` is the first option and selected by default**; keep `Donación única`, `Trimestral`, `Anual` after it.
- Add a small note directly under that select: `💚 Las donaciones mensuales son las que más ayudan: dan estabilidad a los programas durante todo el año.` (small text, `color: var(--green-dark)`).
- The `$25` amount button is already pre-selected — leave that. Optionally add `/mes` framing to the impact-card descriptions (e.g. "$25/mes — un mes de materiales escolares y tutorías").

### B2. Campaign goal + progress thermometer — `donar.html`
- Add a new block right after the `donate-hero`, before the main donate `<section>`. Center it, constrained to `.section-inner`.
- Reuse the bar look from `.t-bar-wrap` / `.t-bar` (green fill on a light track, rounded). Fill ~64% (placeholder).
- Content (all numbers as `.placeholder-tag` sample values): heading `Campaña Temporada 2026`; line `Meta: $5,000 · Recaudado: $3,200 · Faltan 28 días`; the filled bar.
- Add a comment in the HTML noting these are sample figures to be replaced.

### B3. Testimonial beside the form — `donar.html`
- Inside `.donate-layout`, under the `.impact-cards` (left column), add one short testimonial card: a blockquote + attribution. Use placeholders: quote text in `.placeholder-tag`, a small square placeholder photo box, attribution `— Nombre, Sub-XX` (placeholder).

### B4. Sponsorship tiers — `donar.html`
- Add a new `<section>` after the Transparency section titled `Para empresas y aliados` with a 3-column grid (reuse `.impact-card` styling). Tiers (amounts as `.placeholder-tag`):
  - **Patrocina un equipo** — `$___/año` — equipa y acompaña a un equipo completo de una categoría durante la temporada.
  - **Patrocina un torneo** — `$___` — cubre la participación de ADC en un torneo: transporte, inscripción e hidratación.
  - **Aliado anual** — `$_____/año` — apoyo integral a los tres pilares: deporte, educación y nutrición.
- End with a `.btn.btn--primary` button `Proponer alianza` → `contactanos.html`.

### B5. "Dona por Yappy" block (optional) — `donar.html`
- Small block near the form: heading `También puedes donar por Yappy`, a placeholder Yappy number (`.placeholder-tag`), and a placeholder QR image box (`160×160`, dashed `--border`, label "QR — PENDIENTE"). Add an HTML comment that this block is optional and can be deleted if Yappy isn't used.

### B6. Thank-you / confirmation page — new file `gracias.html`
- Copy the header, nav, and footer from `donar.html` so it matches exactly.
- Hero: `¡Gracias por tu donación!` + short message: their gift funds sport, education, and nutrition for the kids of Curundú, and they'll receive a confirmation email shortly. **Do not** mention tax receipts/deductibility — say `correo de confirmación` only.
- Two buttons: `Volver al inicio` → `index.html`, and `Síguenos en Instagram` → `https://instagram.com/adcurundu`.
- In `donar.html`, make the mock submit route to `gracias.html` (e.g., have `handleDonate()` redirect there). Keep it a front-end mock — no real submission.

### B7. "Voces de Curundú" athlete-story block — `blog.html`
- Add a section with an intro paragraph (`.placeholder-tag`) and 3 athlete-story cards. Each card: placeholder photo box, age group (`Sub-XX`), name, 2–3 line bio, and a short quote — all `.placeholder-tag`. Use a card/grid pattern consistent with the existing blog listing.

---

## PART C — Drop the game from the homepage
- In `index.html`, remove the homepage section that promotes the game (search for `Para los atletas`, `ADC Run`, or `adc-run-game`). Remove that whole `<section>` only.
- **Leave** `adc-run-game.html` and `adc-game-sw.js` in the repo (harmless). If a nav/footer link to the game exists elsewhere, remove that link too.

---

## Finish
- Run a local preview and sanity-check: new sections render and match the site style; `.placeholder-tag` values are clearly marked; `gracias.html` inherits header/footer; `grep -rni "registrad" --include=*.html .` is clean outside `/admin`; no tax-deductibility wording was added.
- Make focused commits (e.g., "Remove registered-nonprofit claims", "Add donation-page mockups", "Add gracias.html", "Drop homepage game"). Don't push until the user has reviewed.
