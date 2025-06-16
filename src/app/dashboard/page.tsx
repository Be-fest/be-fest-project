export default function DashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF9F9' }}>
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-purple-600 mb-4">
          Bem-vindo ao Be Fest!
        </h1>
        <p className="text-gray-600 mb-6">
          Login realizado com sucesso. Em breve você terá acesso a todas as funcionalidades da plataforma.
        </p>
        <div className="w-16 h-16 mx-auto mb-4">
          <div className="w-full h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
