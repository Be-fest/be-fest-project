export function AuthLoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-[#F71875] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-600 text-sm">Carregando...</p>
      </div>
    </div>
  );
} 