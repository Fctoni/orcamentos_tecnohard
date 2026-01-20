# 🔐 FASE 2: Autenticação

**Duração Estimada:** Semana 1  
**Objetivo:** Sistema de login funcionando com Supabase Auth

---

## 📋 Checklist de Tarefas

- [ ] 2.1 Criar página de Login
- [ ] 2.2 Criar página de Registro
- [ ] 2.3 Integrar Supabase Auth
- [ ] 2.4 Configurar middleware de autenticação
- [ ] 2.5 Criar componente AuthProvider
- [ ] 2.6 Implementar logout
- [ ] 2.7 Criar validações com Zod
- [ ] 2.8 Adicionar feedback visual (toasts)
- [ ] 2.9 Persistência de sessão

---

## 2.1 Criar Página de Login

**`app/(auth)/login/page.tsx`:**

```typescript
import { LoginForm } from '@/components/features/auth/login-form'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/logo-tecnohard.png"
              alt="Tecno Hard"
              width={200}
              height={80}
              priority
              className="object-contain"
            />
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
```

---

## 2.2 Criar Página de Registro

**`app/(auth)/register/page.tsx`:**

```typescript
import { RegisterForm } from '@/components/features/auth/register-form'
import Image from 'next/image'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/logo-tecnohard.png"
              alt="Tecno Hard"
              width={200}
              height={80}
              priority
              className="object-contain"
            />
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
```

---

## 2.3 Componentes de Autenticação

### Schemas de Validação

**`lib/utils/validators.ts`:**

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
```

### Formulário de Login

**`components/features/auth/login-form.tsx`:**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginFormData } from '@/lib/utils/validators'

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao fazer login',
          description: error.message === 'Invalid login credentials'
            ? 'Email ou senha incorretos'
            : error.message,
        })
        return
      }

      toast({
        title: 'Login realizado com sucesso!',
        description: 'Redirecionando...',
      })

      router.push('/orcamentos')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro inesperado',
        description: 'Tente novamente mais tarde',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLoading}
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </Form>
  )
}
```

### Formulário de Registro

**`components/features/auth/register-form.tsx`:**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { registerSchema, type RegisterFormData } from '@/lib/utils/validators'

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      })

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao criar conta',
          description: error.message,
        })
        return
      }

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Você já pode fazer login.',
      })

      router.push('/login')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro inesperado',
        description: 'Tente novamente mais tarde',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <Input
                  placeholder="Seu nome"
                  autoComplete="name"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isLoading}
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar senha</FormLabel>
              <FormControl>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Criando conta...' : 'Criar conta'}
        </Button>
      </form>
    </Form>
  )
}
```

---

## 2.4 Hook de Autenticação

**`lib/hooks/use-auth.ts`:**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Buscar usuário atual
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
  }
}
```

---

## 2.5 Layout do Dashboard com Header

**`app/(dashboard)/layout.tsx`:**

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Toaster } from '@/components/ui/toaster'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Header user={user} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <Toaster />
    </div>
  )
}
```

### Componente Header

**`components/layout/header.tsx`:**

```typescript
'use client'

import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LogOut, Settings, User as UserIcon, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface HeaderProps {
  user: User
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  async function handleSignOut() {
    try {
      await supabase.auth.signOut()
      toast({
        title: 'Logout realizado',
        description: 'Até logo!',
      })
      router.push('/login')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao sair',
        description: 'Tente novamente',
      })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <a href="/orcamentos" className="flex items-center gap-2">
            <Image
              src="/logo-tecnohard.png"
              alt="Tecno Hard"
              width={140}
              height={50}
              className="object-contain"
            />
          </a>
        </div>

        {/* Navegação */}
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="/orcamentos"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileText className="h-4 w-4" />
            Orçamentos
          </a>
          <a
            href="/config"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="h-4 w-4" />
            Configurações
          </a>
        </nav>

        {/* Menu do usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="md:hidden">
              <a href="/orcamentos" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Orçamentos
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="md:hidden">
              <a href="/config" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="md:hidden" />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
```

---

## 2.6 Página Inicial (Redirect)

**`app/page.tsx`:**

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/orcamentos')
  } else {
    redirect('/login')
  }
}
```

---

## 2.7 Configurar Toaster

**`app/layout.tsx`:**

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistema de Orçamentos - Tecno Hard',
  description: 'Sistema de gestão de orçamentos da Tecno Hard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

---

## 2.8 Hook use-toast (shadcn)

**`hooks/use-toast.ts`:**

Se não foi gerado automaticamente pelo shadcn, criar conforme documentação:
https://ui.shadcn.com/docs/components/toast

---

## 2.9 Páginas Placeholder do Dashboard

**`app/(dashboard)/orcamentos/page.tsx`:**

```typescript
export default function OrcamentosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">📋 Orçamentos</h1>
      </div>
      <p className="text-muted-foreground">
        Lista de orçamentos será implementada na Fase 3.
      </p>
    </div>
  )
}
```

**`app/(dashboard)/config/page.tsx`:**

```typescript
export default function ConfigPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">⚙️ Configurações</h1>
      <p className="text-muted-foreground">
        Configurações serão implementadas em fases futuras.
      </p>
    </div>
  )
}
```

---

## ✅ Critérios de Conclusão da Fase 2

- [ ] Página de login funcionando com validação
- [ ] Página de registro funcionando com validação
- [ ] Login/registro integrado com Supabase Auth
- [ ] Middleware redirecionando usuários não autenticados
- [ ] Middleware redirecionando usuários autenticados para dashboard
- [ ] Header com informações do usuário
- [ ] Logout funcionando
- [ ] Toasts de feedback para ações
- [ ] Sessão persistida após refresh
- [ ] Estilos visuais limpos e consistentes

---

## 🧪 Testes Manuais

1. **Registro:**
   - Acessar `/register`
   - Preencher formulário com dados válidos
   - Verificar criação da conta
   - Verificar redirect para login

2. **Login:**
   - Acessar `/login`
   - Preencher com credenciais corretas
   - Verificar redirect para `/orcamentos`
   - Verificar nome/email no header

3. **Proteção de Rotas:**
   - Tentar acessar `/orcamentos` sem login
   - Verificar redirect para `/login`

4. **Logout:**
   - Clicar no avatar → Sair
   - Verificar redirect para `/login`
   - Verificar que não consegue acessar dashboard

5. **Persistência:**
   - Fazer login
   - Atualizar página (F5)
   - Verificar que continua logado

---

## 🔗 Próxima Fase

➡️ [FASE 3: Listagem de Orçamentos](./FASE3.MD)




