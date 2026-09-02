import Link from "next/link";
import WaitlistCount from "@/components/WaitlistCount";
import WaitlistForm from "@/components/WaitlistForm";

const steps = [
  {
    number: "01",
    icon: "👤",
    title: "Create your account",
    text: "Join LeonardX as a Client ready to hire or a Freelancer ready to discover new opportunities.",
  },
  {
    number: "02",
    icon: "🔎",
    title: "Discover opportunities",
    text: "Post jobs, explore projects, and connect with people whose skills match your needs.",
  },
  {
    number: "03",
    icon: "🤝",
    title: "Work together",
    text: "Communicate, collaborate, share files, and complete meaningful work in one place.",
  },
  {
    number: "04",
    icon: "✨",
    title: "Unlock Premium",
    text: "Access LeonardX AI and premium tools designed to help you work smarter and grow faster.",
  },
];

const features = [
  {
    icon: "💼",
    title: "Find Quality Work",
    text: "Discover freelance opportunities and connect with clients looking for your skills.",
    link: "/jobs",
  },
  {
    icon: "🤝",
    title: "Hire Great Talent",
    text: "Post jobs and connect with skilled professionals ready to help your business grow.",
    link: "/signup?role=CLIENT",
  },
  {
    icon: "🤖",
    title: "LeonardX AI",
    text: "Premium AI tools designed to help you think faster, create better, and work smarter.",
    link: "/ai",
  },
  {
    icon: "🏆",
    title: "Grow With Referrals",
    text: "Invite people to LeonardX, track your referrals, unlock badges, and grow the community.",
    link: "/referrals",
  },
];

const categories = [
  "Web Development",
  "Graphic Design",
  "Mobile Development",
  "Writing",
  "Digital Marketing",
  "Video Editing",
  "UI/UX Design",
  "Data & AI",
];

export default function Home() {
  return (
    <main className="home-page">
      {/* HERO */}
      <section className="hero">
        <div className="hero-grid-bg" />
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />

        <header className="topbar">
          <Link className="brand" href="/">
            <span className="brand-mark">LX</span>
            Leonard<span>X</span>
          </Link>

          <nav className="topnav">
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#premium">Premium</a>
            <Link href="/jobs">Jobs</Link>

            <Link className="nav-login" href="/login">
              Log in
            </Link>

            <Link
              className="nav-signup"
              href="/signup?role=FREELANCER"
            >
              Get started <span>→</span>
            </Link>
          </nav>
        </header>

        <div className="announcement">
          <span className="announcement-dot" />
          <span>
            LeonardX is coming soon to Google Play Store and the App Store.
          </span>
          <a href="#waitlist">Join the waitlist →</a>
        </div>

        <div className="hero-grid">
          <div className="hero-copy">
            <div className="hero-badge">
              <span>🇳🇬</span>
              Built for Nigeria. Ready for the world.
            </div>

            <h1>
              Nigeria&apos;s future of
              <span> work starts here.</span>
            </h1>

            <p className="hero-text">
              Find opportunities. Hire incredible talent. Work together.
              Grow faster with a powerful freelance marketplace built for
              Nigeria and enhanced by LeonardX AI.
            </p>

            <div className="hero-actions">
              <Link
                className="primary-button"
                href="/signup?role=FREELANCER"
              >
                Start freelancing
                <span>→</span>
              </Link>

              <Link
                className="secondary-button"
                href="/signup?role=CLIENT"
              >
                <span>✦</span>
                Hire talent
              </Link>
            </div>

            <div className="hero-trust">
              <div className="trust-avatars">
                <span>👨🏿‍💻</span>
                <span>👩🏾‍💻</span>
                <span>👨🏽‍💼</span>
                <span>👩🏿‍🎨</span>
              </div>

              <div>
                <strong>Join the LeonardX community</strong>
                <WaitlistCount />
              </div>
            </div>

            <div className="hero-mini-stats">
              <div>
                <strong>💼</strong>
                <span>Find work</span>
              </div>

              <div>
                <strong>🤝</strong>
                <span>Hire talent</span>
              </div>

              <div>
                <strong>🤖</strong>
                <span>Work smarter</span>
              </div>
            </div>
          </div>

          {/* WAITLIST */}
          <div id="waitlist" className="form-card">
            <div className="form-card-glow" />

            <div className="form-card-top">
              <span className="form-status">
                <span />
                EARLY ACCESS OPEN
              </span>

              <h2>Get in before launch. 🚀</h2>

              <p>
                Join the LeonardX waitlist and become part of the next
                generation of freelancers and clients.
              </p>
            </div>

            <WaitlistForm />

            <div className="form-benefits">
              <span>✓ Early updates</span>
              <span>✓ Launch access</span>
              <span>✓ No spam</span>
            </div>
          </div>
        </div>

        <div className="hero-bottom">
          <span>FREELANCE</span>
          <i>✦</i>
          <span>COLLABORATE</span>
          <i>✦</i>
          <span>GROW</span>
          <i>✦</i>
          <span>AI POWERED</span>
        </div>
      </section>

      {/* SOCIAL / VALUE */}
      <section className="section platform-intro">
        <div className="platform-intro-card">
          <div className="intro-glow" />

          <div>
            <p className="eyebrow">ONE PLATFORM. MORE POSSIBILITIES.</p>

            <h2>
              More than a marketplace.
              <span> A place to build your future.</span>
            </h2>
          </div>

          <p>
            LeonardX brings freelancers, clients, collaboration, payments,
            referrals, Premium tools, and AI together in one powerful
            ecosystem.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section features-section">
        <div className="section-heading center-heading">
          <p className="eyebrow">WHY LEONARDX</p>

          <h2>
            Everything you need to
            <span> move forward.</span>
          </h2>

          <p>
            Whether you are building your freelance career, hiring talent,
            or growing a business, LeonardX gives you the tools to make
            progress.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <Link
              className="feature-card"
              href={feature.link}
              key={feature.title}
            >
              <div className="feature-card-top">
                <div className="feature-icon">{feature.icon}</div>
                <span className="feature-arrow">↗</span>
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.text}</p>

              <span className="feature-link">
                Explore LeonardX <b>→</b>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section categories-section">
        <div className="categories-content">
          <div className="section-heading">
            <p className="eyebrow">EXPLORE OPPORTUNITIES</p>

            <h2>
              Your next opportunity
              <span> could be waiting.</span>
            </h2>

            <p>
              Explore work across different industries and connect with
              people looking for exactly what you can do.
            </p>

            <Link href="/jobs" className="secondary-button">
              Explore jobs <span>→</span>
            </Link>
          </div>

          <div className="category-cloud">
            {categories.map((category) => (
              <span key={category}>{category}</span>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="section how-section">
        <div className="section-heading center-heading">
          <p className="eyebrow">HOW IT WORKS</p>

          <h2>
            Start simple.
            <span> Go further.</span>
          </h2>

          <p>
            LeonardX makes it easy to move from signing up to building real
            opportunities.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((step) => (
            <article className="step-card" key={step.number}>
              <div className="step-card-top">
                <span className="step-number">{step.number}</span>
                <span className="step-icon">{step.icon}</span>
              </div>

              <div className="step-line" />

              <h3>{step.title}</h3>

              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* AI SECTION */}
      <section className="section ai-showcase">
        <div className="ai-showcase-bg" />
        <div className="ai-showcase-glow" />

        <div className="ai-content">
          <div className="ai-copy">
            <div className="ai-badge">
              <span>✦</span>
              LEONARDX PREMIUM
            </div>

            <h2>
              Meet your new
              <span> AI advantage.</span>
            </h2>

            <p>
              LeonardX AI is built to help you think, write, create, and
              work faster. Premium members get access to powerful AI tools
              directly inside the LeonardX ecosystem.
            </p>

            <div className="ai-points">
              <div>
                <span>✦</span>
                Smart work assistance
              </div>

              <div>
                <span>✦</span>
                Faster writing and ideas
              </div>

              <div>
                <span>✦</span>
                Premium AI access
              </div>
            </div>

            <Link href="/ai" className="primary-button">
              Explore LeonardX AI <span>→</span>
            </Link>
          </div>

          <div className="ai-visual">
            <div className="ai-window">
              <div className="ai-window-header">
                <div className="ai-window-brand">
                  <span>✦</span>
                  LeonardX AI
                </div>

                <span className="ai-live">
                  <i />
                  PREMIUM
                </span>
              </div>

              <div className="ai-message user">
                Help me write a strong proposal for a web design project.
              </div>

              <div className="ai-message bot">
                <span className="bot-icon">✦</span>
                <p>
                  Absolutely. Let&apos;s create a proposal that clearly shows
                  your value and helps you stand out.
                </p>
              </div>

              <div className="ai-suggestions">
                <span>Write proposal</span>
                <span>Improve profile</span>
                <span>Get ideas</span>
              </div>
            </div>

            <div className="ai-floating-card ai-card-one">
              <span>⚡</span>
              Work faster
            </div>

            <div className="ai-floating-card ai-card-two">
              <span>✦</span>
              Think bigger
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM */}
      <section id="premium" className="section premium">
        <div className="premium-header">
          <div>
            <p className="eyebrow">LEONARDX PREMIUM</p>

            <h2>
              Unlock more.
              <span> Do more.</span>
            </h2>
          </div>

          <p>
            Upgrade when you are ready and unlock additional tools designed
            for ambitious professionals.
          </p>
        </div>

        <div className="premium-grid">
          <article className="premium-card featured">
            <div className="premium-card-shine" />

            <div className="premium-icon">✦</div>

            <span className="premium-label">PREMIUM AI</span>

            <h3>Premium AI Access</h3>

            <p>
              Unlock LeonardX AI tools designed to help you work smarter,
              create faster, and improve productivity.
            </p>

            <ul>
              <li>✓ LeonardX AI access</li>
              <li>✓ Premium productivity tools</li>
              <li>✓ Smarter work assistance</li>
            </ul>

            <Link href="/payments" className="premium-button">
              Get Premium <span>→</span>
            </Link>
          </article>

          <article className="premium-card">
            <div className="premium-icon">🛡️</div>

            <span className="premium-label">MANUAL PAYMENT</span>

            <h3>Secure Payment Review</h3>

            <p>
              Submit your payment proof and our team reviews your
              submission before activating Premium access.
            </p>

            <ul>
              <li>✓ Upload payment proof</li>
              <li>✓ Pending status tracking</li>
              <li>✓ Admin approval process</li>
            </ul>

            <Link href="/payments" className="premium-button">
              Submit payment <span>→</span>
            </Link>
          </article>

          <article className="premium-card">
            <div className="premium-icon">🚀</div>

            <span className="premium-label">COMMUNITY</span>

            <h3>Grow Your Network</h3>

            <p>
              Invite others to LeonardX, track referrals, and unlock
              community badges as the platform grows.
            </p>

            <ul>
              <li>✓ Personal referral code</li>
              <li>✓ Referral tracking</li>
              <li>✓ Unlock badges</li>
            </ul>

            <Link href="/referrals" className="premium-button">
              View referrals <span>→</span>
            </Link>
          </article>
        </div>
      </section>

      {/* MOBILE */}
      <section className="section download">
        <div className="download-glow download-glow-one" />
        <div className="download-glow download-glow-two" />

        <div className="download-content">
          <div className="download-copy">
            <div className="download-badge">
              <span>📱</span>
              COMING TO MOBILE
            </div>

            <h2>
              LeonardX is coming
              <span> to your phone.</span>
            </h2>

            <p>
              Take your work, opportunities, conversations, and AI tools
              with you wherever you go.
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
          </div>

          <div className="phone-mockups">
            <div className="phone phone-back">
              <div className="phone-screen">
                <div className="phone-top">
                  <span>9:41</span>
                  <span>●●●</span>
                </div>

                <div className="phone-logo">LX</div>

                <p>Find your next opportunity</p>

                <div className="mini-job">
                  <strong>Website Designer</strong>
                  <span>₦150,000 budget</span>
                </div>

                <div className="mini-job">
                  <strong>Mobile Developer</strong>
                  <span>₦300,000 budget</span>
                </div>
              </div>
            </div>

            <div className="phone phone-front">
              <div className="phone-screen">
                <div className="phone-top">
                  <span>9:41</span>
                  <span>●●●</span>
                </div>

                <div className="phone-ai-title">
                  <span>✦</span>
                  LeonardX AI
                </div>

                <div className="phone-ai-message">
                  How can I help you work smarter today?
                </div>

                <div className="phone-ai-options">
                  <span>Write</span>
                  <span>Create</span>
                  <span>Grow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="final-cta-glow" />

        <div className="final-cta-content">
          <p className="eyebrow">READY FOR WHAT&apos;S NEXT?</p>

          <h2>
            Your next opportunity
            <span> starts with one step.</span>
          </h2>

          <p>
            Join LeonardX and become part of a growing community building
            the future of work in Nigeria.
          </p>

          <div className="hero-actions">
            <Link
              href="/signup?role=FREELANCER"
              className="primary-button"
            >
              Join LeonardX <span>→</span>
            </Link>

            <Link href="/jobs" className="secondary-button">
              Explore jobs
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-brand">
          <Link className="brand" href="/">
            <span className="brand-mark">LX</span>
            Leonard<span>X</span>
          </Link>

          <p>
            Nigeria&apos;s freelancing and AI platform for the next
            generation of work.
          </p>
        </div>

        <div className="footer-links">
          <div>
            <strong>Platform</strong>
            <Link href="/jobs">Find jobs</Link>
            <Link href="/signup?role=CLIENT">Hire talent</Link>
            <Link href="/ai">LeonardX AI</Link>
          </div>

          <div>
            <strong>Account</strong>
            <Link href="/login">Log in</Link>
            <Link href="/signup">Create account</Link>
            <Link href="/referrals">Referrals</Link>
          </div>

          <div>
            <strong>Support</strong>
            <Link href="/support">Support centre</Link>
            <Link href="/contact">Contact us</Link>
            <Link href="/trust">Trust & Safety</Link>
            <Link href="/payments">Premium</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} LeonardX. All rights reserved.
          </p>

          <span><Link href="/privacy">Privacy</Link> · <Link href="/payment-policy">Payments</Link> · <Link href="/refunds">Refunds</Link> · Built for Nigeria 🇳🇬</span>
        </div>
      </footer>
    </main>
  );
}