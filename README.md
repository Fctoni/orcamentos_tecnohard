# 📋 Orçamentos Tecnohard

Sistema web para criação e gerenciamento de orçamentos.

---

## 🛠️ Tecnologias

| Tecnologia | Descrição |
|------------|-----------|
| ⚡ **Next.js 16** | Framework React |
| 🗄️ **Supabase** | Banco de dados e autenticação |
| 🎨 **Tailwind CSS** | Estilização |
| 📄 **React PDF** | Geração de PDFs |

---

## ✨ Funcionalidades

- 🔐 Autenticação de usuários (login/registro)
- ➕ Criação, edição e visualização de orçamentos
- 📊 Listagem de orçamentos com filtros
- 📄 Exportação para PDF
- ⚙️ Configurações do sistema

---

## 🚀 Como rodar

```bash
# 📦 Instalar dependências
npm install

# 💻 Rodar em desenvolvimento
npm run dev

# 🏗️ Build de produção
npm run build
npm start
```

> O app estará disponível em `http://localhost:3000`

---

## 📁 Estrutura

```
app/
├── 🔐 (auth)/          # Páginas de autenticação
├── 📊 (dashboard)/     # Páginas do sistema
│   ├── orcamentos/     # CRUD de orçamentos
│   └── config/         # Configurações
└── 🔌 api/             # Endpoints da API
```
