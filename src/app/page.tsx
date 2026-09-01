
import Link from "next/link";
import WaitlistCount from "@/components/WaitlistCount";
import WaitlistForm from "@/components/WaitlistForm";

const steps = [
  {
    number: "01",
    title: "Create your account",
    text: "Join LeonardX as a Client ready to hire or a Freelancer ready to discover new opportunities.",
  },
  {
    number: "02",
    title: "Discover opportunities",
    text: "Post jobs, explore projects, and connect with people whose skills match your needs.",
  },
  {
    number: "03",
    title: "Work together",
    text: "Communicate, collaborate, share files, and complete meaningful work in one place.",
  },
  {
    number: "04",
    title: "Unlock more with Premium",
    text: "Access LeonardX AI and premium tools designed to help you work smarter and grow faster.",
  },
];

const features = [
  {
    icon: "💼",
    title: "Find Quality Work",
    text: "Discover opportunities built for talented freelancers and professionals.",
  },
  {
    icon: "🤝",
    title: "Hire Great Talent",
    text: "Connect with skilled professionals ready to help your business grow.",
  },
  {
    icon: "✨",
    title: "LeonardX AI",
    text: "Use powerful AI tools to improve productivity and work more efficiently.",
  },
];

export default function Home() {
  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <header className="topbar">
          <Link className="brand" href="/">
            <span className="brand-mark">LX</span>
            Leonard<span>X</span>
          </Link>

          <nav className="topnav">
            <Link href="#how-it-works">How it works</Link>
            <Link href="#features">Features</Link>
            <Link href="#premium">Premium</Link>
            <Link href="/contact">Contact</Link>

            <Link className="nav-login" href="/login">
              Log in
            </Link>

            <Link
              className="nav-signup"
              href="/signup?role=FREELANCER"
            >
              Get started
            </Link>
          </nav>
        </header>

        <div className="announcement">
          <span className="announcement-dot" />
          LeonardX is coming soon to Google Play Store and the App Store.
          <a href="#waitlist"> Join the waitlist now →</a>
        </div>

        <div className="hero-grid">
          <div className="hero-copy">
            <div className="hero-badge">
              🇳🇬 Built for Nigeria. Ready for the world.
            </div>

            <h1>
              The smarter way to
              <span> work, hire, and grow.</span>
            </h1>

            <p className="hero-text">
              LeonardX connects talented freelancers with ambitious clients
              while bringing powerful AI tools into the future of work.
            </p>

            <div className="hero-actions">
              <Link
                className="primary-button"
                href="/signup?role=FREELANCER"
              >
                Start as a Freelancer
                <span>→</span>
              </Link>

              <Link
                className="secondary-button"
                href="/signup?role=CLIENT"
              >
                Hire Talent
              </Link>
            </div>

            <div className="hero-trust">
              <div className="trust-avatars">
                <span>👨🏿‍💻</span>
                <span>👩🏾‍💻</span>
                <span>👨🏽‍💼</span>
              </div>

              <div>
                <strong>Join the LeonardX community</strong>
                <WaitlistCount />
              </div>
            </div>
          </div>

          {/* WAITLIST CARD */}
          <div id="waitlist" className="form-card">
            <div className="form-card-top">
              <span className="form-status">
                <span />
                EARLY ACCESS
              </span>

              <h2>Be among the first.</h2>

              <p>
                Join the LeonardX waitlist and get early updates before
                the official launch.
              </p>
            </div>

            <WaitlistForm />

            <p className="form-note">
              No spam. Just important LeonardX launch updates.
            </p>
          </div>
        </div>

        <div className="hero-bottom">
          <span>FREELANCE</span>
          <span>•</span>
          <span>COLLABORATE</span>
          <span>•</span>
          <span>GROW</span>
          <span>•</span>
          <span>AI POWERED</span>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section features-section">
        <div className="section-heading center-heading">
          <p className="eyebrow">WHY LEONARDX</p>

          <h2>
            Everything you need to
            <span> move your work forward.</span>
          </h2>

          <p>
            Whether you are hiring, freelancing, or building your next big
            idea, LeonardX gives you one place to make progress.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>

              <h3>{feature.title}</h3>

              <p>{feature.text}</p>

              <span className="feature-arrow">→</span>
            </article>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="section how-section">
        <div className="section-heading">
          <p className="eyebrow">HOW IT WORKS</p>

          <h2>A simpler way to work, hire, and grow.</h2>

          <p>
            From creating your account to completing meaningful work,
            LeonardX makes the process simple.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((step) => (
            <article className="step-card" key={step.number}>
              <span className="step-number">{step.number}</span>

              <div className="step-line" />

              <h3>{step.title}</h3>

              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* PREMIUM */}
      <section id="premium" className="section premium">
        <div className="premium-content">
          <div className="premium-copy">
            <p className="eyebrow">LEONARDX PREMIUM</p>

            <h2>
              Work smarter with
              <span> LeonardX AI.</span>
            </h2>

            <p>
              Upgrade your experience with premium tools designed to help
              freelancers and professionals achieve more.
            </p>

            <Link href="#waitlist" className="primary-button">
              Join the waitlist
              <span>→</span>
            </Link>
          </div>

          <div className="premium-grid">
            <article className="premium-card featured">
              <div className="premium-icon">✦</div>

              <h3>Premium AI Access</h3>

              <p>
                Unlock LeonardX AI tools designed to help you work smarter,
                create faster, and improve productivity.
              </p>

              <span className="premium-label">COMING SOON</span>
            </article>

            <article className="premium-card">
              <div className="premium-icon">✓</div>

              <h3>Premium Access Review</h3>

              <p>
                Submit your payment proof and receive Premium access after
                secure admin approval.
              </p>

              <span className="premium-label">SECURE REVIEW</span>
            </article>
          </div>
        </div>
      </section>

      {/* DOWNLOAD */}
      <section className="section download">
        <div className="download-badge">COMING TO MOBILE</div>

        <h2>
          LeonardX is coming
          <span> to your phone.</span>
        </h2>

        <p>
          Join the waitlist today and be ready when LeonardX launches on
          mobile.
        </p>

        <div className="store-buttons">
          <button disabled>
            <span className="store-icon">▶</span>

            <span>
              <small>COMING SOON ON</small>
              Google Play
            </span>
          </button>

          <button disabled>
            <span className="store-icon"></span>

            <span>
              <small>COMING SOON ON</small>
              App Store
            </span>
          </button>
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta">
        <p className="eyebrow">READY FOR WHAT'S NEXT?</p>

        <h2>
          Join the future of
          <span> work in Nigeria.</span>
        </h2>

        <a href="#waitlist" className="primary-button">
          Join the Waitlist
          <span>→</span>
        </a>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div>
          <Link className="brand" href="/">
            <span className="brand-mark">LX</span>
            Leonard<span>X</span>
          </Link>

          <p>
            Nigerian Freelancing + AI Platform.
          </p>
        </div>

        <p>
          © {new Date().getFullYear()} LeonardX. All rights reserved.
        </p>
      </footer>
    </main>
  );
}