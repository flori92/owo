"use client";
import { useState } from "react";
import useAuth from "@/utils/useAuth";
import { Eye, EyeOff, Lock, Mail, User, Smartphone } from "lucide-react";

export default function SignUpPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password || !name) {
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

    // Validation mot de passe (niveau bancaire)
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setLoading(false);
      return;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setError(
        "Le mot de passe doit contenir: majuscule, minuscule, chiffre et caractère spécial",
      );
      setLoading(false);
      return;
    }

    try {
      await signUpWithCredentials({
        email,
        password,
        name: name.trim(),
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      const errorMessages = {
        OAuthSignin:
          "Impossible de créer le compte. Réessayez ou utilisez une autre méthode.",
        OAuthCallback: "Échec de la création après redirection. Réessayez.",
        OAuthCreateAccount:
          "Impossible de créer un compte avec cette méthode. Essayez une autre.",
        EmailCreateAccount:
          "Cet email est déjà utilisé. Essayez de vous connecter ou utilisez un autre email.",
        Callback:
          "Quelque chose s'est mal passé lors de la création. Réessayez.",
        OAuthAccountNotLinked:
          "Ce compte est lié à une méthode différente. Utilisez-la.",
        CredentialsSignin:
          "Email déjà existant ou données invalides. Si vous avez déjà un compte, connectez-vous.",
        AccessDenied: "Vous n'avez pas l'autorisation de créer un compte.",
        Configuration:
          "La création de compte ne fonctionne pas en ce moment. Réessayez plus tard.",
        Verification:
          "Votre lien de création a expiré. Demandez-en un nouveau.",
      };

      setError(
        errorMessages[err.message] || "Une erreur s'est produite. Réessayez.",
      );
      setLoading(false);
    }
  };

  // Indicateur de force du mot de passe
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    return score;
  };

  const passwordStrength = getPasswordStrength();
  const strengthColors = [
    "#EF4444",
    "#F97316",
    "#EAB308",
    "#22C55E",
    "#059669",
  ];
  const strengthLabels = [
    "Très faible",
    "Faible",
    "Moyen",
    "Fort",
    "Très fort",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00D4AA] to-[#00B8A9] flex items-center justify-center px-4 py-8">
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
            Créer votre compte owo!
          </h1>
          <p className="text-gray-600 text-sm">
            Rejoignez des millions d'utilisateurs en Afrique de l'Ouest
          </p>
        </div>

        <div className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nom complet
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <User size={18} color="#6B7280" strokeWidth={1.5} />
              </div>
              <input
                required
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom complet"
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#00D4AA] focus:ring-2 focus:ring-[#00D4AA]/20 outline-none transition-all text-base"
              />
            </div>
          </div>

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
              Mot de passe sécurisé
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

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-2 flex-1 rounded-full ${
                        level <= passwordStrength
                          ? `bg-[${strengthColors[passwordStrength - 1]}]`
                          : "bg-gray-200"
                      }`}
                      style={{
                        backgroundColor:
                          level <= passwordStrength
                            ? strengthColors[passwordStrength - 1]
                            : "#E5E7EB",
                      }}
                    ></div>
                  ))}
                </div>
                <p
                  className="text-xs font-medium"
                  style={{
                    color:
                      passwordStrength > 0
                        ? strengthColors[passwordStrength - 1]
                        : "#6B7280",
                  }}
                >
                  Force:{" "}
                  {passwordStrength > 0
                    ? strengthLabels[passwordStrength - 1]
                    : "Entrez un mot de passe"}
                </p>
              </div>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-medium text-gray-700">
              Exigences du mot de passe :
            </p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div
                className={`flex items-center ${password.length >= 8 ? "text-green-600" : "text-gray-400"}`}
              >
                <span className="mr-1">•</span> 8+ caractères
              </div>
              <div
                className={`flex items-center ${/[A-Z]/.test(password) ? "text-green-600" : "text-gray-400"}`}
              >
                <span className="mr-1">•</span> Majuscule
              </div>
              <div
                className={`flex items-center ${/[a-z]/.test(password) ? "text-green-600" : "text-gray-400"}`}
              >
                <span className="mr-1">•</span> Minuscule
              </div>
              <div
                className={`flex items-center ${/\d/.test(password) ? "text-green-600" : "text-gray-400"}`}
              >
                <span className="mr-1">•</span> Chiffre
              </div>
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
            🛡️ Sécurité bancaire - Chiffrement AES-256 et conformité PCI DSS
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || passwordStrength < 4}
            className="w-full bg-gradient-to-r from-[#00D4AA] to-[#00B8A9] text-white py-4 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Création...</span>
              </div>
            ) : (
              "Créer mon compte"
            )}
          </button>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Déjà un compte ?{" "}
              <a
                href={`/account/signin${
                  typeof window !== "undefined" ? window.location.search : ""
                }`}
                className="text-[#00D4AA] hover:text-[#00B8A9] font-medium underline"
              >
                Se connecter
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              En créant un compte, vous acceptez nos{" "}
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
