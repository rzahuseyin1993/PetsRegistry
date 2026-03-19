export interface CmsStarterTemplate {
  html: string;
  css: string;
}

const headerTemplate: CmsStarterTemplate = {
  html: `
    <header class="cms-header">
      <div class="cms-header__brand">
        <div class="cms-header__logo">PR</div>
        <div>
          <p class="cms-header__title">PetsRegistry</p>
          <p class="cms-header__subtitle">Editable header layout</p>
        </div>
      </div>

      <nav class="cms-header__nav">
        <a href="/search">Search</a>
        <a href="/adopt">Adopt</a>
        <a href="/store">Store</a>
        <a href="/pet-expert">AI Expert</a>
        <a href="/lost-pets">Lost Pets</a>
      </nav>

      <div class="cms-header__actions">
        <a class="cms-header__button cms-header__button--ghost" href="/login">Sign In</a>
        <a class="cms-header__button cms-header__button--solid" href="/dashboard">Dashboard</a>
      </div>
    </header>
  `,
  css: `
    .cms-header,
    .cms-header * {
      box-sizing: border-box;
    }

    .cms-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      padding: 18px 28px;
      border: 1px solid hsl(180 11% 88%);
      border-radius: 20px;
      background: hsl(0 0% 100% / 0.92);
      box-shadow: 0 20px 60px hsl(186 45% 18% / 0.08);
      font-family: Arial, sans-serif;
    }

    .cms-header__brand {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 220px;
    }

    .cms-header__logo {
      display: grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border-radius: 14px;
      background: linear-gradient(135deg, hsl(177 82% 39%), hsl(199 77% 46%));
      color: hsl(0 0% 100%);
      font-weight: 700;
      letter-spacing: 0.08em;
    }

    .cms-header__title {
      margin: 0;
      color: hsl(222 47% 16%);
      font-size: 18px;
      font-weight: 700;
    }

    .cms-header__subtitle {
      margin: 2px 0 0;
      color: hsl(215 16% 47%);
      font-size: 12px;
    }

    .cms-header__nav {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 18px;
      flex: 1;
    }

    .cms-header__nav a {
      color: hsl(218 23% 30%);
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
    }

    .cms-header__actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .cms-header__button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 11px 16px;
      border-radius: 999px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
    }

    .cms-header__button--ghost {
      border: 1px solid hsl(180 11% 88%);
      color: hsl(218 23% 30%);
      background: hsl(0 0% 100%);
    }

    .cms-header__button--solid {
      background: linear-gradient(135deg, hsl(177 82% 39%), hsl(199 77% 46%));
      color: hsl(0 0% 100%);
    }

    @media (max-width: 900px) {
      .cms-header {
        flex-direction: column;
        align-items: stretch;
      }

      .cms-header__brand,
      .cms-header__actions {
        justify-content: center;
      }
    }
  `,
};

const footerTemplate: CmsStarterTemplate = {
  html: `
    <footer class="cms-footer">
      <div class="cms-footer__grid">
        <div>
          <div class="cms-footer__brand">
            <div class="cms-footer__logo">PR</div>
            <div>
              <p class="cms-footer__title">PetsRegistry</p>
              <p class="cms-footer__copy">Protect, register, and reunite pets with a footer you can edit visually.</p>
            </div>
          </div>
        </div>

        <div>
          <h3>Quick Links</h3>
          <a href="/search">Find a Pet</a>
          <a href="/store">Store</a>
          <a href="/adopt">Adoption</a>
          <a href="/register">Register</a>
        </div>

        <div>
          <h3>Support</h3>
          <a href="#">Help Center</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>

        <div>
          <h3>Contact</h3>
          <p>info@petsregistry.org</p>
          <p>Available worldwide</p>
          <p>24/7 lost pet alerts</p>
        </div>
      </div>

      <div class="cms-footer__bottom">© 2026 PetsRegistry. Edit this footer directly in the admin builder.</div>
    </footer>
  `,
  css: `
    .cms-footer,
    .cms-footer * {
      box-sizing: border-box;
    }

    .cms-footer {
      padding: 40px 32px 24px;
      border-radius: 28px 28px 0 0;
      background: linear-gradient(180deg, hsl(194 35% 12%), hsl(222 47% 10%));
      color: hsl(180 20% 92%);
      font-family: Arial, sans-serif;
    }

    .cms-footer__grid {
      display: grid;
      grid-template-columns: 1.3fr 1fr 1fr 1fr;
      gap: 28px;
    }

    .cms-footer__brand {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .cms-footer__logo {
      display: grid;
      place-items: center;
      width: 46px;
      height: 46px;
      border-radius: 16px;
      background: linear-gradient(135deg, hsl(177 82% 39%), hsl(199 77% 46%));
      color: hsl(0 0% 100%);
      font-weight: 700;
      letter-spacing: 0.08em;
    }

    .cms-footer__title,
    .cms-footer h3 {
      margin: 0 0 12px;
      color: hsl(0 0% 100%);
      font-size: 17px;
      font-weight: 700;
    }

    .cms-footer__copy,
    .cms-footer p,
    .cms-footer a {
      margin: 0 0 10px;
      color: hsl(190 14% 74%);
      font-size: 14px;
      line-height: 1.6;
      text-decoration: none;
      display: block;
    }

    .cms-footer__bottom {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid hsl(190 13% 24%);
      color: hsl(190 14% 74%);
      font-size: 13px;
      text-align: center;
    }

    @media (max-width: 900px) {
      .cms-footer__grid {
        grid-template-columns: 1fr;
      }
    }
  `,
};

const homeHeroTemplate: CmsStarterTemplate = {
  html: `
    <section class="cms-hero">
      <div class="cms-hero__content">
        <div class="cms-hero__badge">Visual homepage hero</div>
        <h1>Edit your website design directly from the admin panel.</h1>
        <p>Change the headline, colors, buttons, spacing, and layout visually without touching code.</p>

        <div class="cms-hero__search">
          <input type="text" placeholder="Search by pet ID, breed, or microchip" />
          <button type="button">Search</button>
        </div>

        <div class="cms-hero__actions">
          <a class="cms-hero__button cms-hero__button--solid" href="/register">Register Free</a>
          <a class="cms-hero__button cms-hero__button--ghost" href="/adopt">Adopt a Pet</a>
        </div>
      </div>

      <div class="cms-hero__visual">
        <div class="cms-hero__card cms-hero__card--main">
          <div class="cms-hero__orb"></div>
          <p class="cms-hero__eyebrow">Editable visual area</p>
          <h2>Drag blocks, edit text, and restyle sections.</h2>
        </div>
        <div class="cms-hero__card cms-hero__card--floating">
          <span class="cms-hero__pulse"></span>
          <div>
            <strong>Live layout preview</strong>
            <p>Great for hero banners and promotional sections.</p>
          </div>
        </div>
      </div>
    </section>
  `,
  css: `
    .cms-hero,
    .cms-hero * {
      box-sizing: border-box;
    }

    .cms-hero {
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      gap: 40px;
      padding: 48px;
      border-radius: 32px;
      background:
        radial-gradient(circle at top right, hsl(177 82% 39% / 0.18), transparent 35%),
        linear-gradient(180deg, hsl(0 0% 100%), hsl(180 18% 97%));
      border: 1px solid hsl(180 11% 88%);
      font-family: Arial, sans-serif;
      color: hsl(222 47% 16%);
    }

    .cms-hero__badge {
      display: inline-flex;
      padding: 10px 14px;
      border-radius: 999px;
      background: hsl(177 82% 39% / 0.12);
      color: hsl(177 82% 30%);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.03em;
      margin-bottom: 18px;
    }

    .cms-hero h1 {
      margin: 0;
      font-size: 52px;
      line-height: 1.02;
      letter-spacing: -0.04em;
    }

    .cms-hero p {
      margin: 18px 0 0;
      color: hsl(215 16% 39%);
      font-size: 18px;
      line-height: 1.6;
      max-width: 620px;
    }

    .cms-hero__search {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 28px;
      padding: 10px;
      border-radius: 20px;
      background: hsl(0 0% 100%);
      box-shadow: 0 16px 40px hsl(186 45% 18% / 0.08);
      border: 1px solid hsl(180 11% 88%);
    }

    .cms-hero__search input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      background: transparent;
      color: hsl(222 47% 16%);
      font-size: 15px;
      padding: 10px 14px;
    }

    .cms-hero__search button,
    .cms-hero__button {
      border: none;
      cursor: pointer;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
    }

    .cms-hero__search button {
      padding: 14px 18px;
      border-radius: 14px;
      background: linear-gradient(135deg, hsl(177 82% 39%), hsl(199 77% 46%));
      color: hsl(0 0% 100%);
    }

    .cms-hero__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 18px;
    }

    .cms-hero__button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 14px 18px;
      border-radius: 999px;
    }

    .cms-hero__button--solid {
      background: hsl(222 47% 16%);
      color: hsl(0 0% 100%);
    }

    .cms-hero__button--ghost {
      background: hsl(0 0% 100%);
      color: hsl(222 47% 16%);
      border: 1px solid hsl(180 11% 88%);
    }

    .cms-hero__visual {
      position: relative;
      min-height: 420px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cms-hero__card {
      border-radius: 28px;
      background: hsl(222 47% 16%);
      color: hsl(0 0% 100%);
      box-shadow: 0 24px 70px hsl(222 47% 16% / 0.25);
    }

    .cms-hero__card--main {
      width: 100%;
      padding: 30px;
      background:
        radial-gradient(circle at top left, hsl(177 82% 39% / 0.35), transparent 40%),
        linear-gradient(180deg, hsl(222 47% 16%), hsl(215 46% 12%));
    }

    .cms-hero__eyebrow {
      margin: 0 0 10px;
      color: hsl(180 20% 80%);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 12px;
      font-weight: 700;
    }

    .cms-hero__card h2 {
      margin: 12px 0 0;
      font-size: 34px;
      line-height: 1.1;
    }

    .cms-hero__orb {
      width: 120px;
      height: 120px;
      border-radius: 999px;
      background: radial-gradient(circle at 35% 35%, hsl(0 0% 100%), hsl(177 82% 39%) 35%, hsl(199 77% 46%) 68%, hsl(222 47% 16%) 100%);
      margin-bottom: 24px;
    }

    .cms-hero__card--floating {
      position: absolute;
      right: -10px;
      bottom: 24px;
      display: flex;
      align-items: center;
      gap: 14px;
      width: 280px;
      padding: 16px 18px;
      background: hsl(0 0% 100%);
      color: hsl(222 47% 16%);
    }

    .cms-hero__card--floating p {
      margin: 6px 0 0;
      font-size: 13px;
      color: hsl(215 16% 39%);
    }

    .cms-hero__pulse {
      width: 14px;
      height: 14px;
      border-radius: 999px;
      background: hsl(142 71% 45%);
      box-shadow: 0 0 0 10px hsl(142 71% 45% / 0.14);
      flex-shrink: 0;
    }

    @media (max-width: 900px) {
      .cms-hero {
        grid-template-columns: 1fr;
        padding: 30px;
      }

      .cms-hero h1 {
        font-size: 38px;
      }

      .cms-hero__search {
        flex-direction: column;
        align-items: stretch;
      }

      .cms-hero__card--floating {
        position: static;
        width: 100%;
        margin-top: 16px;
      }
    }
  `,
};

const homeBodyTemplate: CmsStarterTemplate = {
  html: `
    <section class="cms-home-body">
      <div class="cms-home-body__intro">
        <p class="cms-home-body__eyebrow">Editable sections</p>
        <h2>Build feature grids, stats, and call-to-action areas visually.</h2>
      </div>

      <div class="cms-home-body__grid">
        <article class="cms-home-body__card">
          <h3>Adoption Listings</h3>
          <p>Promote available pets and tell their story with more visual flexibility.</p>
        </article>
        <article class="cms-home-body__card">
          <h3>Lost Pet Alerts</h3>
          <p>Create high-visibility sections for emergency notices and reunification campaigns.</p>
        </article>
        <article class="cms-home-body__card">
          <h3>Pet Health Records</h3>
          <p>Highlight health tracking, reminders, and care plans using editable cards.</p>
        </article>
      </div>

      <div class="cms-home-body__stats">
        <div><strong>500+</strong><span>Registered pets</span></div>
        <div><strong>24/7</strong><span>Lost pet support</span></div>
        <div><strong>Global</strong><span>Community reach</span></div>
        <div><strong>Fast</strong><span>Visual editing workflow</span></div>
      </div>

      <div class="cms-home-body__cta">
        <div>
          <p class="cms-home-body__eyebrow">Call to action</p>
          <h3>Publish new homepage sections without redeploying the app.</h3>
        </div>
        <a href="/register">Start editing</a>
      </div>
    </section>
  `,
  css: `
    .cms-home-body,
    .cms-home-body * {
      box-sizing: border-box;
    }

    .cms-home-body {
      padding: 28px 0;
      font-family: Arial, sans-serif;
      color: hsl(222 47% 16%);
    }

    .cms-home-body__intro {
      max-width: 760px;
      margin-bottom: 24px;
    }

    .cms-home-body__eyebrow {
      margin: 0 0 10px;
      color: hsl(177 82% 30%);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 12px;
      font-weight: 700;
    }

    .cms-home-body h2,
    .cms-home-body h3 {
      margin: 0;
    }

    .cms-home-body h2 {
      font-size: 36px;
      line-height: 1.08;
    }

    .cms-home-body__grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
      margin-top: 24px;
    }

    .cms-home-body__card {
      padding: 24px;
      border-radius: 24px;
      background: linear-gradient(180deg, hsl(0 0% 100%), hsl(180 18% 97%));
      border: 1px solid hsl(180 11% 88%);
      box-shadow: 0 18px 50px hsl(186 45% 18% / 0.06);
    }

    .cms-home-body__card p {
      margin: 12px 0 0;
      color: hsl(215 16% 39%);
      line-height: 1.6;
      font-size: 15px;
    }

    .cms-home-body__stats {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      margin-top: 20px;
    }

    .cms-home-body__stats div {
      padding: 20px;
      border-radius: 20px;
      background: hsl(222 47% 16%);
      color: hsl(0 0% 100%);
      text-align: center;
    }

    .cms-home-body__stats strong {
      display: block;
      font-size: 24px;
      margin-bottom: 6px;
    }

    .cms-home-body__stats span {
      color: hsl(180 20% 82%);
      font-size: 13px;
    }

    .cms-home-body__cta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      margin-top: 24px;
      padding: 28px;
      border-radius: 28px;
      background: linear-gradient(135deg, hsl(177 82% 39%), hsl(199 77% 46%));
      color: hsl(0 0% 100%);
    }

    .cms-home-body__cta h3 {
      font-size: 28px;
      line-height: 1.15;
      max-width: 640px;
    }

    .cms-home-body__cta a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 14px 18px;
      border-radius: 999px;
      background: hsl(0 0% 100%);
      color: hsl(177 82% 26%);
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      white-space: nowrap;
    }

    @media (max-width: 900px) {
      .cms-home-body__grid,
      .cms-home-body__stats {
        grid-template-columns: 1fr;
      }

      .cms-home-body__cta {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `,
};

export const cmsStarterTemplates: Record<string, CmsStarterTemplate> = {
  header: headerTemplate,
  footer: footerTemplate,
  "home-hero": homeHeroTemplate,
  "home-body": homeBodyTemplate,
};

export const getCmsStarterTemplate = (slug: string) => cmsStarterTemplates[slug] ?? null;
