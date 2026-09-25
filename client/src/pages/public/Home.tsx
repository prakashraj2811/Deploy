import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Search, Heart, Sparkles, Lock, Users, Star, ArrowRight } from "lucide-react";

const STATS = [
  { label: "Verified Profiles", value: "50K+" },
  { label: "Success Stories", value: "8,200+" },
  { label: "Cities Covered", value: "120+" },
  { label: "Years of Trust", value: "12" },
];

const WHY_CHOOSE_US = [
  { icon: ShieldCheck, title: "Verified Profiles", desc: "Every profile goes through identity and photo verification before it goes live." },
  { icon: Lock, title: "Privacy First", desc: "You control exactly who sees your photos, contact details, and profile." },
  { icon: Sparkles, title: "Smart Matching", desc: "Our compatibility engine considers values, lifestyle, and preferences — not just filters." },
  { icon: Users, title: "Real Support", desc: "A dedicated support team and relationship managers for Premium & VIP members." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Create your profile", desc: "Tell us about yourself, your family, and what you're looking for." },
  { step: "02", title: "Discover matches", desc: "Get personalized, compatibility-scored matches every day." },
  { step: "03", title: "Connect & chat", desc: "Send interests, chat securely, and take it at your own pace." },
  { step: "04", title: "Find your person", desc: "Move forward with confidence, backed by verification at every step." },
];

const PLANS = [
  { name: "Free", price: "₹0", tagline: "Get started", features: ["Create your profile", "Limited search", "5 interests / month"] },
  { name: "Premium", price: "₹2,499", tagline: "Most popular", highlight: true, features: ["Unlimited interests", "Advanced search filters", "See contact details", "Priority visibility"] },
  { name: "VIP", price: "₹4,999", tagline: "White-glove service", features: ["Everything in Premium", "Dedicated relationship manager", "Priority support", "Featured profile placement"] },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="badge-premium mb-5">
              <Star className="h-3.5 w-3.5" /> Trusted by 50,000+ families
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight text-ink-900 sm:text-5xl">
              Begin a lifelong journey, <span className="text-brand-500">built on trust.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-600">
              A modern matrimonial platform for families who value privacy, verified profiles, and
              meaningful compatibility — not endless swiping.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary px-7 py-3 text-base">
                Register Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/search" className="btn-secondary px-7 py-3 text-base">
                Search Profiles
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl font-bold text-ink-900">{stat.value}</p>
                  <p className="text-xs text-ink-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="card space-y-4 p-6">
              <p className="text-sm font-semibold text-ink-500">Quick Search</p>
              <div className="grid grid-cols-2 gap-3">
                <select className="input"><option>Looking for</option><option>Bride</option><option>Groom</option></select>
                <select className="input"><option>Age</option><option>21-25</option><option>26-30</option><option>31-35</option></select>
                <select className="input"><option>Religion</option><option>Hindu</option><option>Muslim</option><option>Christian</option><option>Sikh</option></select>
                <select className="input"><option>City</option><option>Mumbai</option><option>Bengaluru</option><option>Delhi</option></select>
              </div>
              <Link to="/search" className="btn-primary w-full">
                <Search className="h-4 w-4" /> Search Now
              </Link>
              <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-ink-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> 100% verified & confidential
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container-page py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-ink-900">Why families trust Sacred Bond</h2>
          <p className="mt-3 text-ink-500">Every detail of the platform is designed around safety, privacy, and genuine compatibility.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_CHOOSE_US.map((item) => (
            <div key={item.title} className="card p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-ink-900">{item.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-ink-900">How it works</h2>
            <p className="mt-3 text-ink-500">Four simple steps to your next chapter.</p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="relative">
                <span className="font-display text-4xl font-bold text-brand-100">{item.step}</span>
                <h3 className="mt-2 font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership plans */}
      <section className="container-page py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-ink-900">Membership plans</h2>
          <p className="mt-3 text-ink-500">Start free. Upgrade when you're ready to connect faster.</p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`card p-7 ${plan.highlight ? "border-brand-300 ring-2 ring-brand-200" : ""}`}>
              {plan.highlight && <span className="badge-premium mb-3">Most Popular</span>}
              <h3 className="font-display text-xl font-bold text-ink-900">{plan.name}</h3>
              <p className="text-sm text-ink-500">{plan.tagline}</p>
              <p className="mt-4 font-display text-3xl font-bold text-ink-900">
                {plan.price}
                {plan.price !== "₹0" && <span className="text-sm font-normal text-ink-400">/plan</span>}
              </p>
              <ul className="mt-5 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink-600">
                    <Heart className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" fill="currentColor" strokeWidth={0} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className={plan.highlight ? "btn-primary mt-6 w-full" : "btn-secondary mt-6 w-full"}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink-900 py-16">
        <div className="container-page text-center">
          <h2 className="font-display text-3xl font-bold text-white">Your story starts with a single step.</h2>
          <p className="mx-auto mt-3 max-w-lg text-ink-300">Join thousands of families who found trusted matches on Sacred Bond.</p>
          <Link to="/register" className="btn-primary mt-7 inline-flex px-8 py-3 text-base">
            Register Free Today
          </Link>
        </div>
      </section>
    </div>
  );
}
