import { Link } from "react-router-dom";
import {
  ShieldAlert,
  HeartHandshake,
  MapPin,
  Package,
  Users,
  ArrowRight,
  CheckCircle2,
  Zap,
} from "lucide-react";

// Static stats (would be fetched from dashboard in a real scenario)
const STATS = [
  { value: "2,400+", label: "Families Helped" },
  { value: "18",     label: "Active Zones" },
  { value: "96%",    label: "Request Approval Rate" },
  { value: "24/7",   label: "Operational" },
];

const FEATURES = [
  {
    icon: MapPin,
    title: "Zone Management",
    description: "Real-time tracking of shelter zones with live capacity monitoring.",
    color: "bg-blue-100 text-primary-800",
  },
  {
    icon: Package,
    title: "Resource Logistics",
    description: "Distribute water, food, and medical supplies with full traceability.",
    color: "bg-emerald-100 text-secondary",
  },
  {
    icon: Users,
    title: "Victim Registry",
    description: "Manage survivor profiles and reservation statuses with one click.",
    color: "bg-amber-100 text-warning",
  },
  {
    icon: Zap,
    title: "Instant Alerts",
    description: "Critical stock and over-capacity alerts pushed directly to admins.",
    color: "bg-red-100 text-danger",
  },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Register", desc: "Create an account with your name, email, and CIN." },
  { step: "2", title: "Request a Spot", desc: "Browse available zones and submit a shelter request." },
  { step: "3", title: "Get Confirmed", desc: "Admin reviews and confirms your spot. Track status in your portal." },
];

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* ── HERO SECTION ──────────────────────────────────────────────────── */}
      <section className="hero-gradient min-h-[92vh] flex items-center relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-6">
              <HeartHandshake className="h-4 w-4 text-emerald-400" />
              Post-Earthquake Emergency Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Shelter &amp; Safety,{" "}
              <span className="text-emerald-400">Connected.</span>
            </h1>

            <p className="text-blue-100 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl">
              Safe-Shelter Connect links earthquake survivors with available
              shelter zones, coordinates resource distribution, and gives
              administrators a real-time command centre — all in one platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                id="cta-need-shelter"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white text-primary-800 font-bold rounded-2xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base"
              >
                <HeartHandshake className="h-5 w-5" />
                I Need Shelter
              </Link>

              <Link
                to="/login"
                id="cta-admin-portal"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-transparent border-2 border-white/50 text-white font-bold rounded-2xl hover:bg-white/10 transition-all duration-200 text-base"
              >
                <ShieldAlert className="h-5 w-5" />
                Admin Portal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-extrabold text-primary-800">{s.value}</div>
                <div className="text-sm text-slate-500 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Everything you need in a crisis</h2>
            <p className="text-slate-500 mt-3 text-lg max-w-2xl mx-auto">
              Built for speed and reliability, Safe-Shelter Connect handles
              logistics from shelter assignment to resource tracking.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6 hover:shadow-md transition-shadow duration-300 group">
                <div className={`inline-flex p-3 rounded-xl ${f.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Three steps to safety</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 relative">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-primary-800 text-white flex items-center justify-center text-xl font-extrabold mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA BANNER ──────────────────────────────────────────────── */}
      <section className="hero-gradient py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <CheckCircle2 className="h-14 w-14 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to find shelter?
          </h2>
          <p className="text-blue-200 text-lg mb-8">
            Register now and get assigned to a safe shelter zone in minutes.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-800 font-bold rounded-2xl hover:bg-blue-50 transition-colors shadow-lg text-base"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShieldAlert className="h-5 w-5 text-emerald-400" />
            <span className="font-bold text-white text-sm">Safe-Shelter Connect</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2025 Safe-Shelter Connect. Built with care for those who need it most.
          </p>
        </div>
      </footer>
    </div>
  );
}
