# Sistema de Votação da Mesa Diretora (ACE)

Sistema oficial de votação e apuração digital para a **Associação Cearense de Escritores (ACE)**, com suporte a cédula eletrônica anônima, apuração com quórum estatutário (50% + 1) e votação distribuída via celulares dos associados através de integração com **Supabase** e **Supabase Realtime**.

---

## 📱 Votação por Aparelho Celular

- Cada votante utiliza a câmera do seu smartphone para ler o **QR Code** exibido no telão da assembleia (`/display`).
- A cabine de votação mobile abre instantaneamente no navegador do celular.
- A eleição é sincronizada em tempo real:
  - Quando a mesa diretora abre a eleição, a tela de votação é liberada simultaneamente em todos os celulares.
  - Ao registrar o voto, o voto é salvo de forma 100% anônima no banco de dados e o aparelho é bloqueado para novas votações locais (`localStorage`).
  - O placar de votos computados no telão e no dashboard sobe instantaneamente via WebSocket (Supabase Realtime).

---

## 🛠️ Configuração do Banco de Dados (Supabase)

### 1. Criar as Tabelas e Políticas de RLS
Acesse o seu projeto no painel do [Supabase](https://app.supabase.com), abra o **SQL Editor** e execute o script contido em:
```
supabase/schema.sql
```
Esse script cria:
- As tabelas `elections`, `slates`, `votes` e `voters`.
- As políticas de segurança (Row Level Security - RLS), garantindo que apenas eleições abertas recebam votos.
- A publicação no canal `supabase_realtime` para atualização ao vivo do telão.

### 2. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

---

## 🚀 Executando o Projeto

```bash
# Instalar dependências
yarn

# Iniciar servidor de desenvolvimento (Vite)
yarn dev

# Rodar testes unitários
yarn test

# Gerar build de produção
yarn build
```

---

## 🧭 Rotas do Sistema

- `/`: Painel de Controle (Dashboard) e status geral.
- `/setup`: Configuração da eleição e chapas (protegido por PIN do mesário).
- `/voting`: Cabine de votação mobile para os celulares dos associados.
- `/voted`: Comprovante de voto computado.
- `/display` (ou `/telao`): Telão para projeção na assembleia com QR Code gigante e contador de votos em tempo real.
- `/results`: Apuração formal com ata e cálculo de maioria absoluta.
- `/backup`: Exportação e restauração de cópias de segurança em JSON com SHA-256.
