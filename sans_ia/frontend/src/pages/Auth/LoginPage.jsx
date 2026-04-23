import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, ShieldAlert, Eye, EyeOff, Loader2, HeartHandshake, MapPin, Users, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const HIGHLIGHTS = [
  { icon: HeartHandshake, text: "Connecting survivors with safe shelter since 2025" },
  { icon: MapPin, text: "6 active zones across the region" },
  { icon: Users, text: "2,400+ families already assisted" },
  { icon: CheckCircle2, text: "96% request confirmation rate" },
];

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
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
      await login(form);
    } catch (err) {
      const message = err.response?.data?.message || "Invalid email or password.";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (branding) ── */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative blobs */}
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

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Shelter & Safety,<br />
              <span className="text-emerald-400">Connected.</span>
            </h2>
            <p className="text-blue-200 text-lg leading-relaxed max-w-sm">
              The emergency platform linking earthquake survivors with safe zones and real-time resources.
            </p>
          </div>
          <div className="space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl border border-white/10">
                  <Icon className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="text-blue-100 text-sm font-medium">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-blue-300 text-xs">
          © 2025 Safe-Shelter Connect. Built for those who need it most.
        </p>
      </div>

      {/* ── Right panel (form) ── */}
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
              <h1 className="text-2xl font-extrabold text-slate-900">Welcome back</h1>
              <p className="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-fade-in">
                <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-800 leading-tight">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="login-email">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    id="login-email"
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="login-password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    id="login-password"
                    name="password"
                    type={showPass ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
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
                id="login-submit"
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full mt-2 py-3.5"
              >
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <p className="text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-semibold text-primary-800 hover:underline">
                Register here
              </Link>
            </p>

            <p className="text-center text-xs text-slate-400 mt-4">
              Are you an admin?{" "}
              <span className="text-slate-500">Use your admin email &amp; password.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
