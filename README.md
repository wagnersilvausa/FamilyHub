# FamilyHub 👨‍👩‍👦

**Sistema familiar para controle e acompanhamento do Davi**

FamilyHub é uma aplicação web mobile-first desenvolvida com Next.js para gerenciar gastos, compromissos, saúde e documentos da família. Com interface intuitiva, botões grandes e fonte legível, é perfeita para qualquer pessoa usar.

## 🎯 Funcionalidades

### 💰 Módulo Financeiro

- Registrar gastos com valor, cartão, motivo e observação
- Controle automático de parcelamentos (cria lançamentos futuros)
- Status do gasto: Pendente, Quitado, Urgente
- Filtros por mês e cartão
- Relatório mensal com envio via Telegram para Wagner

### 📅 Módulo de Agenda

- Criar compromissos (consultas, escola, atividades)
- Calendário visual
- Lembretes automáticos via Telegram (Vercel Cron Job)

### 🏥 Módulo de Saúde

- Histórico de consultas (médico, data, observações)
- Medicamentos contínuos (nome, dose, frequência)
- Upload de receitas e laudos

### 📷 Módulo de Fotos/Documentos

- Upload de fotos com categorias
- Captura de câmera ou galeria
- Busca global por nome, categoria ou descrição

### 📊 Dashboard

- Total gasto no mês
- Próximos compromissos
- Últimos lançamentos
- Timeline cronológica

## 🚀 Setup & Instalação

### 1. Pré-requisitos

- Node.js 18+ instalado
- Conta no [Supabase](https://supabase.com)
- Bot do Telegram criado (usar @BotFather)

### 2. Clonar e Instalar Dependências

```bash
cd familyhub
npm install
```

### 3. Configurar Supabase

1. Criar novo projeto em [supabase.com](https://supabase.com)
2. Ir para SQL Editor e executar o arquivo `schema.sql`
3. Obter as chaves:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 4. Configurar Telegram Bot

1. Abrir [@BotFather](https://t.me/botfather) no Telegram
2. Criar novo bot com `/newbot`
3. Copiar o token do bot (`TELEGRAM_BOT_TOKEN`)
4. Enviar uma mensagem para seu bot e usar:
   ```
   https://api.telegram.org/botSEU_TOKEN/getUpdates
   ```
5. Copiar o `chat_id` da resposta JSON

### 5. Variáveis de Ambiente

1. Copiar `.env.example` para `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Preencher as variáveis:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
   SUPABASE_SERVICE_ROLE_KEY=xxxxx
   TELEGRAM_BOT_TOKEN=xxxxx
   TELEGRAM_CHAT_ID=xxxxx
   CRON_SECRET=sua-chave-secreta-aleatoria
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 6. Executar Localmente

```bash
npm run dev
```

Acessar em [http://localhost:3000](http://localhost:3000)

## 📱 Rotas da Aplicação

### Interface da Mãe (Wagner)

- `/registrar` - Painel principal
- `/registrar/gasto` - Registrar gasto
- `/registrar/gastos` - Ver gastos
- `/registrar/fotos` - Adicionar foto
- `/registrar/fotos-galeria` - Ver fotos
- `/registrar/agenda` - Criar compromisso
- `/registrar/agenda-view` - Ver agenda
- `/registrar/saude` - Registrar saúde
- `/registrar/saude-view` - Ver saúde
- `/registrar/relatorio` - Relatório mensal

### Interface do Pai (Wagner)

- `/painel` - Dashboard
- `/painel/timeline` - Timeline do Davi

## 🔄 Vercel Cron Job

### Configurar Lembretes Automáticos

1. Fazer deploy no Vercel:

   ```bash
   npm install -g vercel
   vercel deploy
   ```

2. Ir para Vercel Dashboard → Project → Cron Jobs

3. Adicionar novo Cron Job:
   - **Path**: `/api/cron/reminder`
   - **Schedule**: `0 8 * * *` (8h da manhã todo dia)
   - **Secret**: usar o valor de `CRON_SECRET`

4. Cada dia às 8h, verifica compromissos para amanhã e envia reminder no Telegram

## 🎨 Design & UX

- ✅ Interface mobile-first
- ✅ Botões grandes (48px+)
- ✅ Fonte grande e legível
- ✅ Cores vibrantes e contraste alto
- ✅ Máximo 3 cliques para qualquer ação
- ✅ Feedback visual clara após salvar
- ✅ Mensagens de erro em português

## 📊 Banco de Dados

### Tabelas Supabase

**gastos**

- id, valor, cartao, motivo, observacao, data, horario, parcela_atual, parcelas_total, valor_parcela, status, created_at

**parcelas_futuras**

- id, gasto_id, valor, mes_referencia, status, created_at

**agenda**

- id, titulo, tipo, data, hora, observacao, created_at

**saude_consultas**

- id, medico, data, observacoes, foto_url, created_at

**medicamentos**

- id, nome, dose, frequencia, created_at

**documentos**

- id, titulo, descricao, categoria, subcategoria, arquivo_url, tipo_arquivo, data, created_at

**audios**

- id, descricao, audio_url, modulo, created_at

## 🔐 Segurança

- Usar `NEXT_PUBLIC_` apenas para chaves públicas do Supabase
- Nunca compartilhar `SUPABASE_SERVICE_ROLE_KEY`
- Usar `.env.local` (não fazer commit)
- Ativar RLS (Row Level Security) em produção

## 🚀 Deploy no Vercel

```bash
# Login
vercel login

# Deploy
vercel deploy

# Variáveis de ambiente
# Ir para Vercel Dashboard → Settings → Environment Variables
# Adicionar todas as variáveis de .env.local
```

## 📝 Próximas Melhorias

- [ ] Upload de fotos para Supabase Storage
- [ ] Gravação de áudio in-app
- [ ] Gráficos de gastos (Chart.js)
- [ ] Autenticação de usuários
- [ ] Backup automático
- [ ] Notificações push
- [ ] Modo offline com sync

## 🤝 Contribuindo

Ideias, sugestões e melhorias são bem-vindas!
