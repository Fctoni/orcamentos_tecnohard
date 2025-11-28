import { RegisterForm } from '@/components/features/auth/register-form'

export default function RegisterPage() {
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
            Criar Conta
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Preencha os dados para criar sua conta
          </p>
          
          {/* Formulário */}
          <RegisterForm />
          
          {/* Link para login */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem uma conta?{' '}
            <a href="/login" className="text-primary hover:underline font-medium">
              Fazer login
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
