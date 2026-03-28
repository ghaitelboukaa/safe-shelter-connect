import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail, Lock, User, CreditCard, ShieldAlert, Eye, EyeOff, Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [form, setForm] = useState({
    email: "", password: "", nom: "", prenom: "", cin: "",
  });
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(form);
  };

  return (
    <div className="min-h-screen hero-gradient-subtle flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md glass rounded-3xl p-8 sm:p-10 animate-fade-in">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-primary-800 rounded-2xl mb-4">
            <ShieldAlert className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Create an account</h1>
          <p className="text-slate-500 text-sm mt-1">Register to request emergency shelter</p>
        </div>

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
            className="btn-primary w-full mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">Already have an account?</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <Link
          to="/login"
          className="btn-outline w-full text-sm py-2.5"
        >
          Sign In Instead
        </Link>
      </div>
    </div>
  );
}
