"use client";
import { useState } from "react";
import useAuth from "@/utils/useAuth";
import { Eye, EyeOff, Lock, Mail, Smartphone } from "lucide-react";

export default function SignInPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { signInWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }

    // Validation email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format d'email invalide");
      setLoading(false);
      return;
    }

    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      const errorMessages = {
        OAuthSignin:
          "Impossible de vous connecter. Réessayez ou utilisez une autre méthode.",
        OAuthCallback: "Échec de la connexion après redirection. Réessayez.",
        OAuthCreateAccount:
          "Impossible de créer un compte avec cette méthode. Essayez une autre.",
        EmailCreateAccount:
          "Cet email ne peut pas être utilisé. Il est peut-être déjà enregistré.",
        Callback:
          "Quelque chose s'est mal passé lors de la connexion. Réessayez.",
        OAuthAccountNotLinked:
          "Ce compte est lié à une méthode de connexion différente. Utilisez-la.",
        CredentialsSignin:
          "Email ou mot de passe incorrect. Vérifiez vos identifiants.",
        AccessDenied: "Vous n'avez pas l'autorisation de vous connecter.",
        Configuration:
          "La connexion ne fonctionne pas en ce moment. Réessayez plus tard.",
        Verification:
          "Votre lien de connexion a expiré. Demandez-en un nouveau.",
      };

      setError(
        errorMessages[err.message] || "Une erreur s'est produite. Réessayez.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00D4AA] to-[#00B8A9] flex items-center justify-center px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white rounded-full blur-2xl"></div>
      </div>

      <form
        noValidate
        onSubmit={onSubmit}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#00D4AA] to-[#00B8A9] rounded-2xl mb-4">
            <Smartphone size={32} color="#FFFFFF" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Bienvenue sur owo!
          </h1>
          <p className="text-gray-600 text-sm">
            Connectez-vous à votre portefeuille digital sécurisé
          </p>
        </div>

        <div className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Adresse email
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Mail size={18} color="#6B7280" strokeWidth={1.5} />
              </div>
              <input
                required
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#00D4AA] focus:ring-2 focus:ring-[#00D4AA]/20 outline-none transition-all text-base"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Lock size={18} color="#6B7280" strokeWidth={1.5} />
              </div>
              <input
                required
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#00D4AA] focus:ring-2 focus:ring-[#00D4AA]/20 outline-none transition-all text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff size={18} strokeWidth={1.5} />
                ) : (
                  <Eye size={18} strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
              ⚠️ {error}
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            🔐 Connexion sécurisée - Vos données sont chiffrées et protégées
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#00D4AA] to-[#00B8A9] text-white py-4 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connexion...</span>
              </div>
            ) : (
              "Se connecter"
            )}
          </button>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Pas encore de compte ?{" "}
              <a
                href={`/account/signup${
                  typeof window !== "undefined" ? window.location.search : ""
                }`}
                className="text-[#00D4AA] hover:text-[#00B8A9] font-medium underline"
              >
                Créer un compte
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              En vous connectant, vous acceptez nos{" "}
              <a href="#" className="text-[#00D4AA] underline">
                Conditions d'utilisation
              </a>{" "}
              et notre{" "}
              <a href="#" className="text-[#00D4AA] underline">
                Politique de confidentialité
              </a>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
