# CineFy

Aplicativo mobile para guardar filmes, escrever resenhas e registrar cenas favoritas. Feito com React Native, Expo, TypeScript e Supabase.

## Testar no Android

[Baixar o APK do CineFy](https://github.com/cs-stefany/Resenhas/releases/latest/download/CineFy-v1.0.0.apk)

No celular Android, abra o link acima, baixe o arquivo e permita a instalação quando o sistema solicitar. O aplicativo é distribuído diretamente pelo GitHub, então o Android pode exibir um aviso sobre instalação de fonte externa.

O banco começa vazio: crie uma conta, confirme o e-mail e entre para testar filmes, resenhas e cenas.

## O que funciona

- criação de conta com nome, data de nascimento, e-mail e senha;
- confirmação de e-mail e sessão persistente;
- login, logout e recuperação de senha por link;
- cadastro, edição, pesquisa, filtro e exclusão de filmes;
- resenhas e cenas vinculadas aos filmes do usuário;
- avaliação de zero a cinco estrelas;
- câmera, galeria e upload de imagens;
- atualização em tempo real;
- isolamento dos dados por usuário com Row Level Security (RLS).

## Executar pelo código-fonte

Pré-requisitos: Node.js, npm e o aplicativo Expo Go no celular.

```bash
git clone https://github.com/cs-stefany/Resenhas.git
cd Resenhas
npm install
copy .env.example .env.local
npm start
```

Preencha o `.env.local` antes de iniciar:

```env
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
```

Com o computador e o celular na mesma rede, leia o QR Code com o Expo Go. Se a rede bloquear a conexão local, execute `npx expo start --tunnel`.

## Preparar o Supabase

1. Crie um projeto em [Supabase](https://supabase.com/dashboard).
2. Abra **SQL Editor**, cole o conteúdo de `supabase/migrations/001_initial_schema.sql` e execute.
3. Em **Project Settings → API**, copie a URL do projeto e a chave pública (`publishable` ou `anon`) para o `.env.local`.
4. Em **Authentication → URL Configuration → Redirect URLs**, adicione:
   - `cinefy://**` para builds instalados;
   - a URL `exp://...` exibida pelo Expo durante o desenvolvimento, quando for testar links pelo Expo Go.
5. Em **Authentication → Providers → Email**, mantenha o provedor de e-mail habilitado.

O SQL cria as tabelas, índices, políticas de segurança, bucket de imagens e publicação de Realtime. Nunca coloque a `service_role` no aplicativo.

## Verificações

```bash
npm run typecheck
npx expo export --platform android
```

## Estrutura principal

- `contexts/AuthContext.tsx`: restauração e mudanças da sessão;
- `screens/Login.tsx`: entrada e solicitação de recuperação;
- `screens/Registro.tsx`: cadastro e confirmação de e-mail;
- `screens/RedefinirSenha.tsx`: definição da nova senha;
- `screens/unified/`: telas ativas de filmes, resenhas e cenas;
- `components/FormModal.tsx`: formulários de criação e edição;
- `supabase/migrations/`: estrutura segura do backend.
