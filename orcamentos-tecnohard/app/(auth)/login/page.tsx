import { LoginForm } from '@/components/features/auth/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <span className="text-3xl font-bold text-primary">Tecno Hard</span>
          </div>
          
          {/* Título */}
          <h1 className="text-2xl font-bold text-center text-foreground mb-2">
            Bem-vindo
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Entre com suas credenciais para acessar o sistema
          </p>
          
          {/* Formulário */}
          <LoginForm />
          
          {/* Link para registro */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Não tem uma conta?{' '}
            <a href="/register" className="text-primary hover:underline font-medium">
              Cadastre-se
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
