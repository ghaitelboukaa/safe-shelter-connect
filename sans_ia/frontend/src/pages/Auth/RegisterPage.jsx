import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail, Lock, User, CreditCard, ShieldAlert, Eye, EyeOff, Loader2,
  HeartHandshake, Shield, Clock, MapPin,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const STEPS = [
  { icon: User, title: "Personal Info", desc: "Your name and national ID (CIN)" },
  { icon: Mail, title: "Account Details", desc: "Email and secure password" },
  { icon: MapPin, title: "Request Shelter", desc: "Browse and claim your spot" },
];

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [form, setForm] = useState({
    email: "", password: "", nom: "", prenom: "", cin: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await register(form);
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel (Branding) ── */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">
              Safe-Shelter<span className="text-emerald-400">Connect</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-10">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Get shelter in<br />
              <span className="text-emerald-400">three easy steps.</span>
            </h2>
            <p className="text-blue-200 text-base leading-relaxed max-w-sm">
              Create your free account and secure a spot in a nearby shelter zone in minutes.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-5">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-white text-sm">
                  {i + 1}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{title}</p>
                  <p className="text-blue-300 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badge */}
          <div className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl border border-white/15">
            <Shield className="h-5 w-5 text-emerald-400 shrink-0" />
            <p className="text-blue-100 text-xs leading-relaxed">
              Your data is used exclusively for shelter assignment. We never share it with third parties.
            </p>
          </div>
        </div>

        <p className="relative z-10 text-blue-300 text-xs">
          © 2025 Safe-Shelter Connect. Built for those who need it most.
        </p>
      </div>

      {/* ── Right Panel (Form) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-slate-50">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="p-2.5 bg-primary-800 rounded-2xl">
                <ShieldAlert className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-primary-800">
                Safe-Shelter<span className="text-secondary">Connect</span>
              </span>
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100">
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-slate-900">Create an account</h1>
              <p className="text-slate-500 text-sm mt-1">Register to request emergency shelter</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-fade-in shadow-sm">
                <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-800 leading-tight">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="reg-prenom">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      id="reg-prenom"
                      name="prenom"
                      type="text"
                      required
                      value={form.prenom}
                      onChange={handleChange}
                      placeholder="Youssef"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="reg-nom">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      id="reg-nom"
                      name="nom"
                      type="text"
                      required
                      value={form.nom}
                      onChange={handleChange}
                      placeholder="Alaoui"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* CIN */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="reg-cin">
                  National ID (CIN)
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    id="reg-cin"
                    name="cin"
                    type="text"
                    required
                    value={form.cin}
                    onChange={handleChange}
                    placeholder="AB123456"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="reg-email">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="reg-password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    id="reg-password"
                    name="password"
                    type={showPass ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="input-field pl-10 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="register-submit"
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full mt-2 py-3.5"
              >
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400 font-medium">Already have an account?</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <Link to="/login" className="btn-outline w-full text-sm py-2.5">
              Sign In Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
