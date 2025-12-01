export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold mb-6">owo!</h1>
        <p className="text-xl text-[#959697] mb-8">
          Votre portefeuille digital sécurisé pour l'Afrique de l'Ouest
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/account/signin"
            className="px-6 py-3 bg-[#F2F2F2] text-[#18191B] rounded-lg font-medium hover:bg-[#E5E5E5] transition-colors"
          >
            Se connecter
          </a>
          <a
            href="/account/signup"
            className="px-6 py-3 bg-[#2C2D2F] text-[#F2F2F2] rounded-lg font-medium hover:bg-[#3C3D3F] transition-colors"
          >
            S'inscrire
          </a>
        </div>
      </div>
    </div>
  );
}
