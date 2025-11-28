export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Tecno Hard - Sistema de Orçamentos</h1>
          <nav className="flex gap-4">
            <a href="/orcamentos" className="text-sm hover:text-primary">Orçamentos</a>
            <a href="/config" className="text-sm hover:text-primary">Configurações</a>
          </nav>
        </div>
      </header>
      <main className="container py-6">
        {children}
      </main>
    </div>
  )
}


