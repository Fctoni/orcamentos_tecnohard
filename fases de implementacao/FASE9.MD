# 🚀 FASE 9: Deploy

**Duração Estimada:** Semana 5  
**Objetivo:** Sistema em produção na Vercel

---

## 📋 Checklist de Tarefas

- [ ] 9.1 Preparar projeto para produção
- [ ] 9.2 Configurar variáveis de ambiente
- [ ] 9.3 Criar conta/projeto na Vercel
- [ ] 9.4 Conectar repositório Git
- [ ] 9.5 Configurar domínio (opcional)
- [ ] 9.6 Deploy inicial
- [ ] 9.7 Testes em produção
- [ ] 9.8 Configurações finais do Supabase
- [ ] 9.9 Documentação final

---

## 9.1 Preparar Projeto para Produção

### Verificar Build Local

```bash
npm run build
```

Corrigir quaisquer erros que apareçam.

### Verificar Lint

```bash
npm run lint
```

### Otimizar Imagens

Garantir que o logo e outras imagens estão otimizadas:
- Logo em PNG com fundo branco
- Tamanho adequado (não maior que necessário)
- Formatos modernos quando possível (WebP)

### Verificar next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  // Otimizações de produção
  swcMinify: true,
  compress: true,
}

module.exports = nextConfig
```

---

## 9.2 Variáveis de Ambiente

### Criar `.env.example`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Opcional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=

# Opcional: Sentry
SENTRY_DSN=
```

### Variáveis Necessárias na Vercel

| Variável | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase |

---

## 9.3 Criar Projeto na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login (GitHub, GitLab ou email)
3. Clique em "Add New Project"
4. Importe o repositório do projeto

---

## 9.4 Configuração do Deploy

### Na interface da Vercel:

1. **Framework Preset:** Next.js (auto-detectado)
2. **Root Directory:** `.` (raiz)
3. **Build Command:** `npm run build`
4. **Output Directory:** `.next`
5. **Install Command:** `npm install`

### Adicionar Variáveis de Ambiente:

1. Vá em Settings > Environment Variables
2. Adicione cada variável:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Marque para quais ambientes (Production, Preview, Development)

---

## 9.5 Domínio Personalizado (Opcional)

### Usando domínio próprio:

1. Vá em Settings > Domains
2. Adicione seu domínio: `orcamentos.tecnohard.com.br`
3. Configure os DNS conforme instruções da Vercel:
   - Tipo A: `76.76.21.21`
   - Ou CNAME para `cname.vercel-dns.com`

### Usando subdomínio da Vercel:

O projeto receberá automaticamente um domínio como:
`orcamentos-tecnohard.vercel.app`

---

## 9.6 Deploy

### Deploy Automático

Cada push para a branch `main` dispara um deploy automático.

### Deploy Manual

```bash
# Instalar CLI da Vercel (se necessário)
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

---

## 9.7 Testes em Produção

### Checklist Pós-Deploy

**Acesso:**
- [ ] Site carrega corretamente
- [ ] HTTPS funcionando
- [ ] Sem erros no console

**Autenticação:**
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Logout funciona

**Funcionalidades:**
- [ ] Listar orçamentos
- [ ] Criar orçamento
- [ ] Editar orçamento
- [ ] Upload de anexos
- [ ] Download de PDF
- [ ] Exportação CSV/Excel

**Performance:**
- [ ] Tempo de carregamento < 3s
- [ ] Core Web Vitals OK

### Ferramentas de Teste

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- Console do navegador (F12)

---

## 9.8 Configurações Finais do Supabase

### Verificar URL de Redirect

No Supabase Dashboard:
1. Authentication > URL Configuration
2. Adicionar URL de produção em "Redirect URLs":
   - `https://seu-dominio.vercel.app/**`
   - `https://orcamentos.tecnohard.com.br/**`

### Verificar Rate Limits

Em Project Settings > API:
- Verificar limites de requisições
- Ajustar se necessário (plano pago)

### Backup

Verificar se backups automáticos estão habilitados:
- Project Settings > Database > Backups

---

## 9.9 Documentação Final

### Atualizar README.md

```markdown
# Sistema de Orçamentos - Tecno Hard

Sistema web para criação, gestão e exportação de orçamentos.

## 🚀 Deploy

O sistema está disponível em: https://orcamentos.tecnohard.com.br

## 🛠️ Stack Técnica

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Deploy:** Vercel

## 🔧 Desenvolvimento Local

### Requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clonar repositório
git clone https://github.com/tecnohard/orcamentos.git
cd orcamentos

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais

# Rodar em desenvolvimento
npm run dev
```

### Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública do Supabase |

## 📁 Estrutura do Projeto

```
app/
├── (auth)/           # Páginas de autenticação
├── (dashboard)/      # Páginas do sistema
├── api/              # API routes
components/
├── features/         # Componentes específicos
├── layout/           # Layout (header, sidebar)
├── ui/               # Componentes base (shadcn)
lib/
├── hooks/            # Custom hooks
├── supabase/         # Clientes Supabase
├── types/            # TypeScript types
├── utils/            # Utilitários
```

## 📝 Funcionalidades

- ✅ Autenticação (login/registro)
- ✅ CRUD de orçamentos
- ✅ Gestão de itens
- ✅ Upload de anexos
- ✅ Geração de PDF
- ✅ Exportação CSV/Excel
- ✅ Filtros e busca full-text
- ✅ Gestão de status

## 🔒 Segurança

- Row Level Security (RLS) no Supabase
- Autenticação via JWT
- Storage privado para anexos

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de TI.
```

---

## ✅ Critérios de Conclusão da Fase 9

- [ ] Build sem erros
- [ ] Deploy na Vercel realizado
- [ ] Variáveis de ambiente configuradas
- [ ] Site acessível via URL
- [ ] HTTPS funcionando
- [ ] Todas as funcionalidades testadas em produção
- [ ] Performance aceitável
- [ ] Supabase configurado para produção
- [ ] README atualizado
- [ ] Equipe treinada no uso do sistema

---

## 🎉 Projeto Concluído!

Parabéns! O Sistema de Orçamentos Tecno Hard está em produção.

### Próximos Passos (Pós-MVP)

Funcionalidades que podem ser adicionadas futuramente:

- [ ] Dashboard com métricas
- [ ] Controle de acesso por perfil
- [ ] Histórico de alterações
- [ ] Envio de orçamento por e-mail
- [ ] Assinatura eletrônica
- [ ] Integração com ERP
- [ ] Relatórios avançados
- [ ] PWA (Progressive Web App)

---

## 📚 Referências Úteis

- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)




