import Link from "next/link";

type Section = { title: string; body?: string; bullets?: string[] };

export default function PublicInfoPage({ eyebrow, title, intro, sections, updated }: { eyebrow: string; title: string; intro: string; sections: Section[]; updated?: string }) {
  return (
    <main className="public-page">
      <header className="public-header">
        <Link className="brand" href="/"><span className="brand-mark">LX</span>Leonard<span>X</span></Link>
        <nav className="public-nav" aria-label="Public navigation">
          <Link href="/about">About</Link><Link href="/trust">Trust & Safety</Link><Link href="/support">Support</Link><Link className="nav-login" href="/login">Log in</Link>
        </nav>
      </header>
      <section className="public-hero">
        <p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{intro}</p>
        {updated && <small>Last updated: {updated}</small>}
      </section>
      <section className="public-content">
        {sections.map((section) => <article className="public-section" key={section.title}>
          <h2>{section.title}</h2>{section.body && <p>{section.body}</p>}
          {section.bullets && <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}
        </article>)}
      </section>
      <footer className="public-footer"><span>© {new Date().getFullYear()} LeonardX</span><div><Link href="/privacy">Privacy</Link><Link href="/payment-policy">Payments</Link><Link href="/refunds">Refunds</Link><Link href="/contact">Contact</Link></div></footer>
    </main>
  );
}
