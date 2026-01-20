# 🏗️ FASE 1: Infraestrutura

**Duração Estimada:** Semana 1  
**Objetivo:** Setup inicial completo do projeto

---

## 📋 Checklist de Tarefas

- [ ] 1.1 Criar projeto Next.js + TypeScript
- [ ] 1.2 Configurar Tailwind CSS
- [ ] 1.3 Instalar e configurar shadcn/ui
- [ ] 1.4 Configurar Supabase (client + server)
- [ ] 1.5 Criar schema do banco de dados
- [ ] 1.6 Configurar Storage bucket
- [ ] 1.7 Configurar RLS policies
- [ ] 1.8 Criar função de geração de número do orçamento
- [ ] 1.9 Seed inicial (processos)
- [ ] 1.10 Gerar tipos TypeScript do Supabase
- [ ] 1.11 Criar estrutura de pastas
- [ ] 1.12 Adicionar logo Tecno Hard

---

## 1.1 Criar Projeto Next.js + TypeScript

```bash
npx create-next-app@latest orcamentos-tecnohard --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*"
cd orcamentos-tecnohard
```

**Estrutura inicial esperada:**
```
orcamentos-tecnohard/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── public/
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 1.2 Configurar Tailwind CSS

Atualizar `tailwind.config.ts` com a paleta de cores do projeto:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1E40AF",
          foreground: "#FFFFFF",
          hover: "#1E3A8A",
        },
        secondary: {
          DEFAULT: "#F8FAFC",
          foreground: "#1E293B",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        // Cores de Status
        status: {
          cadastrado: "#6B7280",
          aguardando: "#F59E0B",
          enviado: "#3B82F6",
          negociacao: "#F97316",
          aprovado: "#22C55E",
          rejeitado: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## 1.3 Instalar e Configurar shadcn/ui

```bash
npx shadcn@latest init
```

**Opções recomendadas:**
- Style: Default
- Base color: Slate
- CSS variables: Yes

**Instalar componentes necessários:**

```bash
npx shadcn@latest add button input select table dialog badge card dropdown-menu calendar checkbox textarea tabs toast form label separator skeleton alert scroll-area popover command avatar
```

---

## 1.4 Configurar Supabase

### Instalar dependências:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Criar arquivos de configuração:

**`lib/supabase/client.ts`** (Cliente browser):
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`lib/supabase/server.ts`** (Cliente server):
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component - ignore
          }
        },
      },
    }
  )
}
```

**`lib/supabase/middleware.ts`**:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rotas públicas
  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/orcamentos'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

**`middleware.ts`** (na raiz):
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**`.env.local`**:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

---

## 1.5 Criar Schema do Banco de Dados

Executar no Supabase SQL Editor (ou via MCP):

### Tabela: sequencia_orcamentos
```sql
CREATE TABLE sequencia_orcamentos (
    ano integer PRIMARY KEY,
    ultimo_numero integer NOT NULL DEFAULT 0
);
```

### Tabela: processos
```sql
CREATE TABLE processos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo text NOT NULL UNIQUE,
    nome text NOT NULL,
    ativo boolean DEFAULT true,
    ordem integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_processos_ordem ON processos(ordem);
CREATE INDEX idx_processos_codigo ON processos(codigo);
```

### Tabela: orcamentos
```sql
CREATE TABLE orcamentos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    numero text NOT NULL UNIQUE,
    cliente text NOT NULL,
    contato text,
    frete text,
    validade date,
    observacoes text,
    status text NOT NULL DEFAULT 'cadastrado',
    ocultar_valor_total boolean DEFAULT false,
    valor_total decimal DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    updated_at timestamptz DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id),
    
    CONSTRAINT orcamentos_status_check CHECK (
        status IN (
            'cadastrado', 
            'aguardando-informacoes', 
            'enviado', 
            'em-negociacao', 
            'aprovado', 
            'rejeitado'
        )
    )
);

CREATE INDEX idx_orcamentos_numero ON orcamentos(numero);
CREATE INDEX idx_orcamentos_cliente ON orcamentos(cliente);
CREATE INDEX idx_orcamentos_status ON orcamentos(status);
CREATE INDEX idx_orcamentos_created_at ON orcamentos(created_at DESC);

-- Índice full-text para busca
CREATE INDEX idx_orcamentos_search ON orcamentos 
USING GIN (to_tsvector('portuguese', 
  coalesce(numero, '') || ' ' || 
  coalesce(cliente, '') || ' ' || 
  coalesce(contato, '') || ' ' || 
  coalesce(observacoes, '')
));
```

### Tabela: orcamento_itens
```sql
CREATE TABLE orcamento_itens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    orcamento_id uuid NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
    codigo_item text NOT NULL,
    item text NOT NULL,
    unidade text NOT NULL,
    quantidade decimal NOT NULL DEFAULT 1,
    peso_unitario decimal,
    preco_unitario decimal NOT NULL,
    preco_total decimal NOT NULL,
    material text,
    processos text[],
    prazo_entrega text,
    faturamento_minimo text,
    ordem integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_itens_orcamento ON orcamento_itens(orcamento_id);
CREATE INDEX idx_itens_codigo ON orcamento_itens(codigo_item);
CREATE INDEX idx_itens_ordem ON orcamento_itens(ordem);

-- Índice full-text para busca nos itens
CREATE INDEX idx_itens_search ON orcamento_itens 
USING GIN (to_tsvector('portuguese', 
  coalesce(codigo_item, '') || ' ' || 
  coalesce(item, '') || ' ' || 
  coalesce(material, '') || ' ' || 
  coalesce(prazo_entrega, '')
));
```

### Tabela: orcamento_anexos
```sql
CREATE TABLE orcamento_anexos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id uuid NOT NULL REFERENCES orcamento_itens(id) ON DELETE CASCADE,
    nome_arquivo text NOT NULL,
    storage_path text NOT NULL,
    tipo_arquivo text NOT NULL,
    tamanho integer NOT NULL,
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX idx_anexos_item ON orcamento_anexos(item_id);
```

---

## 1.6 Configurar Storage Bucket

```sql
-- Criar bucket para anexos
INSERT INTO storage.buckets (id, name, public)
VALUES ('orcamento-anexos', 'orcamento-anexos', false);

-- Policy para usuários autenticados
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'orcamento-anexos');

CREATE POLICY "Authenticated users can view"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'orcamento-anexos');

CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'orcamento-anexos');
```

---

## 1.7 Configurar RLS Policies

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequencia_orcamentos ENABLE ROW LEVEL SECURITY;

-- Policies para orcamentos
CREATE POLICY "Users can view all orcamentos"
ON orcamentos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create orcamentos"
ON orcamentos FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update orcamentos"
ON orcamentos FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Users can delete orcamentos"
ON orcamentos FOR DELETE
TO authenticated
USING (true);

-- Policies para orcamento_itens
CREATE POLICY "Users can view all itens"
ON orcamento_itens FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage itens"
ON orcamento_itens FOR ALL
TO authenticated
USING (true);

-- Policies para orcamento_anexos
CREATE POLICY "Users can view all anexos"
ON orcamento_anexos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage anexos"
ON orcamento_anexos FOR ALL
TO authenticated
USING (true);

-- Policies para processos
CREATE POLICY "Users can view processos"
ON processos FOR SELECT
TO authenticated
USING (true);

-- Policies para sequencia_orcamentos
CREATE POLICY "Users can view sequencia"
ON sequencia_orcamentos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage sequencia"
ON sequencia_orcamentos FOR ALL
TO authenticated
USING (true);
```

---

## 1.8 Criar Função de Geração de Número do Orçamento

```sql
CREATE OR REPLACE FUNCTION gerar_numero_orcamento()
RETURNS text AS $$
DECLARE
    ano_atual integer;
    proximo_numero integer;
    numero_formatado text;
BEGIN
    ano_atual := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Tenta inserir ou atualizar a sequência
    INSERT INTO sequencia_orcamentos (ano, ultimo_numero)
    VALUES (ano_atual, 1)
    ON CONFLICT (ano) DO UPDATE
    SET ultimo_numero = sequencia_orcamentos.ultimo_numero + 1
    RETURNING ultimo_numero INTO proximo_numero;
    
    -- Formata o número (ex: "2025-0012")
    numero_formatado := ano_atual::text || '-' || LPAD(proximo_numero::text, 4, '0');
    
    RETURN numero_formatado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orcamentos_updated_at
BEFORE UPDATE ON orcamentos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger para recalcular valor_total do orçamento
CREATE OR REPLACE FUNCTION recalcular_valor_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orcamentos
    SET valor_total = (
        SELECT COALESCE(SUM(preco_total), 0)
        FROM orcamento_itens
        WHERE orcamento_id = COALESCE(NEW.orcamento_id, OLD.orcamento_id)
    )
    WHERE id = COALESCE(NEW.orcamento_id, OLD.orcamento_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER itens_recalcular_total
AFTER INSERT OR UPDATE OR DELETE ON orcamento_itens
FOR EACH ROW
EXECUTE FUNCTION recalcular_valor_total();
```

---

## 1.9 Seed Inicial (Processos)

```sql
INSERT INTO processos (codigo, nome, ordem) VALUES
('desempeno', 'Desempeno', 1),
('normalizacao', 'Normalização', 2),
('tempera-inducao', 'Têmpera por Indução', 3),
('tempera', 'Têmpera', 4),
('cementacao', 'Cementação', 5),
('beneficiamento', 'Beneficiamento', 6),
('revenimento', 'Revenimento', 7),
('recozimento-atmosfera', 'Recozimento com atmosfera controlada', 8),
('recozimento-sem-atmosfera', 'Recozimento sem atmosfera', 9);
```

---

## 1.10 Gerar Tipos TypeScript

```bash
npm install supabase --save-dev
npx supabase gen types typescript --project-id "SEU_PROJECT_ID" --schema public > lib/types/database.ts
```

**Ou criar manualmente `lib/types/database.ts`:**

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      orcamentos: {
        Row: {
          id: string
          numero: string
          cliente: string
          contato: string | null
          frete: string | null
          validade: string | null
          observacoes: string | null
          status: OrcamentoStatus
          ocultar_valor_total: boolean
          valor_total: number
          created_at: string
          created_by: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          numero: string
          cliente: string
          contato?: string | null
          frete?: string | null
          validade?: string | null
          observacoes?: string | null
          status?: OrcamentoStatus
          ocultar_valor_total?: boolean
          valor_total?: number
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          numero?: string
          cliente?: string
          contato?: string | null
          frete?: string | null
          validade?: string | null
          observacoes?: string | null
          status?: OrcamentoStatus
          ocultar_valor_total?: boolean
          valor_total?: number
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
        }
      }
      orcamento_itens: {
        Row: {
          id: string
          orcamento_id: string
          codigo_item: string
          item: string
          unidade: string
          quantidade: number
          peso_unitario: number | null
          preco_unitario: number
          preco_total: number
          material: string | null
          processos: string[] | null
          prazo_entrega: string | null
          faturamento_minimo: string | null
          ordem: number
          created_at: string
        }
        Insert: {
          id?: string
          orcamento_id: string
          codigo_item: string
          item: string
          unidade: string
          quantidade?: number
          peso_unitario?: number | null
          preco_unitario: number
          preco_total: number
          material?: string | null
          processos?: string[] | null
          prazo_entrega?: string | null
          faturamento_minimo?: string | null
          ordem?: number
          created_at?: string
        }
        Update: {
          id?: string
          orcamento_id?: string
          codigo_item?: string
          item?: string
          unidade?: string
          quantidade?: number
          peso_unitario?: number | null
          preco_unitario?: number
          preco_total?: number
          material?: string | null
          processos?: string[] | null
          prazo_entrega?: string | null
          faturamento_minimo?: string | null
          ordem?: number
          created_at?: string
        }
      }
      orcamento_anexos: {
        Row: {
          id: string
          item_id: string
          nome_arquivo: string
          storage_path: string
          tipo_arquivo: string
          tamanho: number
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          item_id: string
          nome_arquivo: string
          storage_path: string
          tipo_arquivo: string
          tamanho: number
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          item_id?: string
          nome_arquivo?: string
          storage_path?: string
          tipo_arquivo?: string
          tamanho?: number
          created_at?: string
          created_by?: string | null
        }
      }
      processos: {
        Row: {
          id: string
          codigo: string
          nome: string
          ativo: boolean
          ordem: number
          created_at: string
        }
        Insert: {
          id?: string
          codigo: string
          nome: string
          ativo?: boolean
          ordem?: number
          created_at?: string
        }
        Update: {
          id?: string
          codigo?: string
          nome?: string
          ativo?: boolean
          ordem?: number
          created_at?: string
        }
      }
      sequencia_orcamentos: {
        Row: {
          ano: number
          ultimo_numero: number
        }
        Insert: {
          ano: number
          ultimo_numero?: number
        }
        Update: {
          ano?: number
          ultimo_numero?: number
        }
      }
    }
    Functions: {
      gerar_numero_orcamento: {
        Args: Record<string, never>
        Returns: string
      }
    }
  }
}

export type OrcamentoStatus = 
  | 'cadastrado' 
  | 'aguardando-informacoes' 
  | 'enviado' 
  | 'em-negociacao' 
  | 'aprovado' 
  | 'rejeitado'
```

**`lib/types/app.ts`:**

```typescript
import { Database } from './database'

export type Orcamento = Database['public']['Tables']['orcamentos']['Row']
export type OrcamentoInsert = Database['public']['Tables']['orcamentos']['Insert']
export type OrcamentoUpdate = Database['public']['Tables']['orcamentos']['Update']

export type OrcamentoItem = Database['public']['Tables']['orcamento_itens']['Row']
export type OrcamentoItemInsert = Database['public']['Tables']['orcamento_itens']['Insert']
export type OrcamentoItemUpdate = Database['public']['Tables']['orcamento_itens']['Update']

export type OrcamentoAnexo = Database['public']['Tables']['orcamento_anexos']['Row']
export type OrcamentoAnexoInsert = Database['public']['Tables']['orcamento_anexos']['Insert']

export type Processo = Database['public']['Tables']['processos']['Row']

export interface OrcamentoWithItems extends Orcamento {
  itens: OrcamentoItemWithAnexos[]
}

export interface OrcamentoItemWithAnexos extends OrcamentoItem {
  anexos: OrcamentoAnexo[]
}

export type OrcamentoStatus = 
  | 'cadastrado' 
  | 'aguardando-informacoes' 
  | 'enviado' 
  | 'em-negociacao' 
  | 'aprovado' 
  | 'rejeitado'

export const STATUS_CONFIG: Record<OrcamentoStatus, { label: string; color: string; icon: string }> = {
  'cadastrado': { label: 'Cadastrado', color: 'bg-gray-500', icon: '📝' },
  'aguardando-informacoes': { label: 'Aguardando Informações', color: 'bg-yellow-500', icon: '⏳' },
  'enviado': { label: 'Enviado', color: 'bg-blue-500', icon: '📤' },
  'em-negociacao': { label: 'Em Negociação', color: 'bg-orange-500', icon: '💬' },
  'aprovado': { label: 'Aprovado', color: 'bg-green-500', icon: '✅' },
  'rejeitado': { label: 'Rejeitado', color: 'bg-red-500', icon: '❌' },
}
```

---

## 1.11 Criar Estrutura de Pastas

```
projeto/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── orcamentos/
│   │   │   ├── page.tsx
│   │   │   ├── novo/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── editar/
│   │   │           └── page.tsx
│   │   └── config/
│   │       └── page.tsx
│   ├── api/
│   │   ├── pdf/
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── export/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                  (gerado pelo shadcn)
│   ├── features/
│   │   └── .gitkeep
│   └── layout/
│       └── .gitkeep
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── types/
│   │   ├── database.ts
│   │   └── app.ts
│   ├── utils/
│   │   ├── format.ts
│   │   └── validators.ts
│   └── hooks/
│       └── .gitkeep
├── public/
│   └── logo-tecnohard.png
├── middleware.ts
└── .env.local
```

**Comando para criar estrutura:**

```bash
# Criar pastas
mkdir -p app/(auth)/login app/(auth)/register
mkdir -p app/(dashboard)/orcamentos/novo app/(dashboard)/orcamentos/[id]/editar
mkdir -p app/(dashboard)/config
mkdir -p app/api/pdf/[id] app/api/export
mkdir -p components/features components/layout
mkdir -p lib/supabase lib/types lib/utils lib/hooks

# Criar arquivos placeholder
touch app/(auth)/login/page.tsx
touch app/(auth)/register/page.tsx
touch app/(dashboard)/layout.tsx
touch app/(dashboard)/orcamentos/page.tsx
touch app/(dashboard)/orcamentos/novo/page.tsx
touch app/(dashboard)/orcamentos/[id]/page.tsx
touch app/(dashboard)/orcamentos/[id]/editar/page.tsx
touch app/(dashboard)/config/page.tsx
touch app/api/pdf/[id]/route.ts
touch app/api/export/route.ts
```

---

## 1.12 Adicionar Logo Tecno Hard

1. Obter logo em alta resolução (PNG, fundo branco)
2. Salvar em `public/logo-tecnohard.png`
3. Criar versões otimizadas se necessário

---

## 📦 Dependências Adicionais a Instalar

```bash
# Dependências principais
npm install @supabase/supabase-js @supabase/ssr
npm install date-fns
npm install zod
npm install @react-pdf/renderer
npm install xlsx
npm install lucide-react
npm install tailwindcss-animate

# Formulários
npm install react-hook-form @hookform/resolvers

# Dev dependencies
npm install -D supabase
```

---

## ✅ Critérios de Conclusão da Fase 1

- [ ] Projeto Next.js rodando em `localhost:3000`
- [ ] Tailwind CSS funcionando com cores customizadas
- [ ] shadcn/ui instalado com todos os componentes listados
- [ ] Supabase conectado (client e server)
- [ ] Todas as tabelas criadas no banco
- [ ] RLS policies configuradas
- [ ] Storage bucket criado
- [ ] Função `gerar_numero_orcamento` funcionando
- [ ] Processos inseridos no banco
- [ ] Tipos TypeScript gerados
- [ ] Estrutura de pastas completa
- [ ] Logo da empresa em `/public`
- [ ] `.env.local` configurado

---

## 🔗 Próxima Fase

➡️ [FASE 2: Autenticação](./FASE2.MD)




