import { Link } from 'react-router-dom'
import {
  Accessibility,
  ArrowRight,
  BarChart3,
  Database,
  LayoutDashboard,
  Moon,
  Package,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'

const GITHUB_URL = 'https://github.com/Miftah-Fentaw/React-admin-template'
const LIVE_DEMO_TO = '/dashboard'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

const FEATURES: Feature[] = [
  {
    icon: LayoutDashboard,
    title: 'Complete dashboard',
    description:
      'KPI cards with sparklines, revenue charts, activity feeds, and quick actions out of the box.',
  },
  {
    icon: Users,
    title: 'User management',
    description:
      'Searchable, sortable, paginated lists with create/edit dialogs, detail pages, and role-aware UI.',
  },
  {
    icon: Package,
    title: 'Products & orders',
    description:
      'Catalog CRUD with inventory states plus order detail pages for fulfillment and payment status.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description:
      'URL-synced date ranges with dependency-free SVG area, bar, and donut charts that re-theme automatically.',
  },
  {
    icon: Database,
    title: 'Mock API included',
    description:
      'An MSW-powered mock server with seeded data means every page works before you write a backend.',
  },
  {
    icon: ShieldCheck,
    title: 'Type-safe end to end',
    description:
      'Strict TypeScript and Zod schemas shared by forms and the API layer keep the contract honest.',
  },
  {
    icon: Accessibility,
    title: 'Accessible by default',
    description:
      'Focus-trapped dialogs, WAI-ARIA keyboard patterns, sort announcements, and skip links.',
  },
  {
    icon: Moon,
    title: 'Dark mode',
    description:
      'Light, dark, and system themes persist across visits and apply before first paint — no flash.',
  },
]

const USE_CASES = [
  'Admin dashboards',
  'SaaS applications',
  'CRM systems',
  'Analytics platforms',
  'Ecommerce dashboards',
  'Internal tools',
]

const ARCHITECTURE_LAYERS = [
  'Component',
  'Hook',
  'Service',
  'API Client',
  'Mock API',
  'Mock Data',
]

const FAQ_ITEMS = [
  {
    question: 'Is Vital Admin really free?',
    answer:
      'Yes. Vital Admin is MIT licensed open source — clone it, modify it, and ship it, including in commercial projects.',
  },
  {
    question: 'Does it work without a backend?',
    answer:
      'Yes. A mock API built on Mock Service Worker ships with seeded demo data, so every page works immediately after npm install.',
  },
  {
    question: 'How do I connect my own backend?',
    answer:
      'Point VITE_API_URL at your server and set VITE_ENABLE_MOCK_API=false. Because every feature talks to the API only through its service module, your components and hooks stay untouched.',
  },
  {
    question: 'What is Vital Admin built with?',
    answer:
      'React 19, strict TypeScript, Vite, React Router v7, TanStack Query v5, Zod v4, MSW v2, and plain CSS design tokens — no UI framework, no form library, no chart library.',
  },
]

function LandingHeader() {
  return (
    <header className="landing__header">
      <div className="landing__container landing__header-inner">
        <span className="landing__brand" aria-label="Vital Admin">
          <span className="landing__brand-name">Vital</span>&nbsp;
          <span className="landing__brand-sub">Admin</span>
        </span>
        <nav aria-label="Landing" className="landing__nav">
          <a href="#features">Features</a>
          <a href="#architecture">Architecture</a>
          <a href="#getting-started">Getting started</a>
          <a href="#faq">FAQ</a>
        </nav>
        <Link to={LIVE_DEMO_TO} className="btn btn--primary btn--sm">
          Open live demo
        </Link>
      </div>
    </header>
  )
}

export function LandingPage() {
  return (
    <div className="landing">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <LandingHeader />

      <main id="main">
        <section className="landing__hero">
          <div className="landing__container">
            <p className="landing__eyebrow">Open source · MIT licensed</p>
            <h1 className="landing__title">Free Open-Source React Admin Template</h1>
            <p className="landing__lede">
              Vital Admin is a free, open-source admin template built with TypeScript and
              Vite. It gives you a production-oriented React dashboard — users, products,
              orders, projects, invoices, and analytics — backed by a swappable mock API
              so every page works before you connect a backend.
            </p>
            <div className="landing__actions">
              <Link to={LIVE_DEMO_TO} className="btn btn--primary btn--lg">
                Try the live React admin dashboard
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--secondary btn--lg"
              >
                View Vital Admin on GitHub
              </a>
            </div>
            <img
              src="/preview.png"
              alt="Vital Admin responsive React admin dashboard showing analytics cards, charts, and a sidebar navigation"
              width={1920}
              height={935}
              loading="lazy"
              decoding="async"
              className="landing__preview"
            />
          </div>
        </section>

        <section className="landing__section" aria-labelledby="why-vital-admin">
          <div className="landing__container landing__narrow">
            <h2 id="why-vital-admin">Why Vital Admin?</h2>
            <p>
              Most admin templates hard-wire their UI to fake data. Vital Admin takes the
              opposite approach: the entire application is built against a service layer,
              exactly as it would be against your real backend. The result is a React
              admin panel starter that stays useful long after day one — clone it, explore
              a fully working dashboard, then swap in your API without rewriting the UI.
            </p>
          </div>
        </section>

        <section
          id="features"
          className="landing__section"
          aria-labelledby="features-title"
        >
          <div className="landing__container">
            <h2 id="features-title">Features</h2>
            <p className="landing__section-lede">
              Everything an internal tool needs on day one, wired together and tested.
            </p>
            <ul className="landing__features">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <li key={title} className="landing__feature">
                  <Icon size={20} aria-hidden="true" className="landing__feature-icon" />
                  <h3>{title}</h3>
                  <p>{description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="landing__section" aria-labelledby="use-cases-title">
          <div className="landing__container landing__narrow">
            <h2 id="use-cases-title">Built for Real Applications</h2>
            <p>
              Use Vital Admin as the foundation for the tools your team actually runs —
              any project that needs tables, forms, charts, and authentication
              scaffolding:
            </p>
            <ul className="landing__use-cases">
              {USE_CASES.map((useCase) => (
                <li key={useCase}>{useCase}</li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="architecture"
          className="landing__section landing__section--alt"
          aria-labelledby="architecture-title"
        >
          <div className="landing__container">
            <h2 id="architecture-title">Mock API Architecture</h2>
            <p className="landing__section-lede">
              Data flows through clearly separated layers — never directly from UI to mock
              data.
            </p>
            <ol
              className="landing__flow"
              aria-label="Request flow from component to mock data"
            >
              {ARCHITECTURE_LAYERS.map((layer) => (
                <li key={layer} className="landing__flow-step">
                  {layer}
                  <ArrowRight
                    size={14}
                    aria-hidden="true"
                    className="landing__flow-arrow"
                  />
                </li>
              ))}
            </ol>
            <p className="landing__narrow landing__flow-note">
              Because components depend only on hooks, and hooks only on services, the
              last two links in this chain are disposable. Replace them with your real API
              and nothing above changes.
            </p>
          </div>
        </section>

        <section className="landing__section" aria-labelledby="backend-title">
          <div className="landing__container landing__narrow">
            <h2 id="backend-title">Connect Your Own Backend</h2>
            <ol className="landing__steps">
              <li>
                <strong>Point the client at your server.</strong> Set{' '}
                <code>VITE_API_URL=https://your-api.com</code> and{' '}
                <code>VITE_ENABLE_MOCK_API=false</code>.
              </li>
              <li>
                <strong>Match the response contract.</strong> Lists return{' '}
                <code>{'{ data, meta }'}</code>, single resources wrap in{' '}
                <code>{'{ data }'}</code>, and errors use a shared envelope — documented
                in the README.
              </li>
              <li>
                <strong>Delete the mock layer.</strong> Remove{' '}
                <code>src/data/mock-server/</code> when you are confident — the UI does
                not know it existed.
              </li>
            </ol>
            <p>
              The full integration guide lives in the{' '}
              <a
                href={`${GITHUB_URL}#replacing-the-mock-backend`}
                target="_blank"
                rel="noopener noreferrer"
              >
                README section on replacing the mock backend
              </a>
              .
            </p>
          </div>
        </section>

        <section
          className="landing__section landing__section--alt"
          aria-labelledby="responsive-title"
        >
          <div className="landing__container landing__narrow">
            <h2 id="responsive-title">Responsive React Dashboard</h2>
            <p>
              The layout adapts from wide desktop monitors down to phones: the sidebar
              collapses, tables stay readable, dialogs remain usable, and touch targets
              keep their size. Every screen ships responsive by default, so your admin
              panel works wherever your team opens it.
            </p>
          </div>
        </section>

        <section className="landing__section" aria-labelledby="dark-mode-title">
          <div className="landing__container landing__narrow">
            <h2 id="dark-mode-title">Dark Mode</h2>
            <p>
              All colors come from semantic CSS custom properties, so light, dark, and
              system themes are a single token file away. The saved theme is applied
              before first paint — no flash of the wrong color scheme — and charts
              re-theme automatically because they read the same tokens.
            </p>
          </div>
        </section>

        <section
          id="getting-started"
          className="landing__section landing__section--alt"
          aria-labelledby="getting-started-title"
        >
          <div className="landing__container landing__narrow">
            <h2 id="getting-started-title">Getting Started</h2>
            <pre>
              <code>{`git clone https://github.com/Miftah-Fentaw/React-admin-template.git
cd React-admin-template
npm install
npm run dev`}</code>
            </pre>
            <p>
              Open <code>http://localhost:5173</code> and sign in with the seeded demo
              account <code>admin@vital.dev</code> / <code>admin123</code>. No environment
              variables required.
            </p>
            <div className="landing__actions landing__actions--start">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary"
              >
                View Vital Admin on GitHub
              </a>
              <Link to={LIVE_DEMO_TO} className="btn btn--secondary">
                Try the live demo
              </Link>
            </div>
          </div>
        </section>

        <section id="faq" className="landing__section" aria-labelledby="faq-title">
          <div className="landing__container landing__narrow">
            <h2 id="faq-title">FAQ</h2>
            {FAQ_ITEMS.map(({ question, answer }) => (
              <div key={question} className="landing__faq-item">
                <h3>{question}</h3>
                <p>{answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="landing__footer">
        <div className="landing__container landing__footer-inner">
          <p>
            Vital Admin — a free, open-source React admin template built with TypeScript
            and Vite.
          </p>
          <nav aria-label="Footer" className="landing__footer-nav">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              Source code on GitHub
            </a>
            <a
              href={`${GITHUB_URL}/blob/main/LICENSE`}
              target="_blank"
              rel="noopener noreferrer"
            >
              MIT License
            </a>
            <Link to={LIVE_DEMO_TO}>Live demo</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
