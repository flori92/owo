"use client";
import useAuth from "@/utils/useAuth";
import { LogOut, Smartphone } from "lucide-react";

export default function LogoutPage() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00D4AA] to-[#00B8A9] flex items-center justify-center px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white rounded-full blur-2xl"></div>
      </div>

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center">
        {/* Logo/Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#00D4AA] to-[#00B8A9] rounded-2xl mb-4">
            <Smartphone size={32} color="#FFFFFF" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Déconnexion</h1>
          <p className="text-gray-600 text-sm">
            Êtes-vous sûr de vouloir vous déconnecter de votre compte owo! ?
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-sm text-yellow-700">
          🔐 Pour votre sécurité, vous devrez vous reconnecter pour accéder à
          vos données financières
        </div>

        {/* Logout Button */}
        <button
          onClick={handleSignOut}
          className="w-full bg-gradient-to-r from-[#00D4AA] to-[#00B8A9] text-white py-4 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] mb-4 flex items-center justify-center space-x-2"
        >
          <LogOut size={20} strokeWidth={1.5} />
          <span>Se déconnecter</span>
        </button>

        {/* Cancel Link */}
        <a
          href="/"
          className="text-gray-600 hover:text-gray-800 text-sm font-medium underline"
        >
          Annuler et retourner à l'accueil
        </a>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Vos données restent sécurisées même après déconnexion
          </p>
        </div>
      </div>
    </div>
  );
}
