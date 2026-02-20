# CineFy - App de Resenhas de Filmes

Aplicativo mobile para gerenciar sua coleção de filmes, escrever resenhas e catalogar cenas favoritas.

Desenvolvido com React Native + Expo e Supabase (autenticação, banco de dados e storage).

## Screenshots

*Em breve*

## Funcionalidades por Tela

### Tela de Login
- Autenticação com email e senha
- Redirecionamento automático se já estiver logado
- Link para tela de cadastro

### Tela de Registro
- Criação de nova conta
- Campos: nome, email, senha, data de nascimento
- Após registro, redireciona automaticamente para o menu principal

### Menu Principal (Drawer)
Navegação lateral com acesso a todas as funcionalidades:
- Filmes (Listar / Manter)
- Resenhas (Listar / Manter)
- Cenas (Listar / Manter)

---

### Filmes

#### Listar Filmes
- Visualização de todos os filmes cadastrados
- Exibe: título, gênero, sinopse, data de lançamento e foto
- Atualização em tempo real

#### Manter Filmes
- **Adicionar**: cadastrar novo filme com foto (câmera ou galeria)
- **Editar**: toque no filme para editar seus dados
- **Excluir**: pressione e segure para excluir
- Campos: título*, gênero*, sinopse, data de lançamento*, foto*

---

### Resenhas

#### Listar Resenhas
- Visualização de todas as resenhas cadastradas
- Exibe: filme associado, título, texto e estrelas
- Atualização em tempo real

#### Manter Resenhas
- **Adicionar**: criar nova resenha vinculada a um filme
- **Editar**: toque na resenha para editar
- **Excluir**: pressione e segure para excluir
- Campos: filme*, título*, texto*, estrelas (0-5)

---

### Cenas

#### Listar Cenas
- Visualização de todas as cenas cadastradas
- Exibe: filme associado, título, descrição, observação, estrelas e foto
- Atualização em tempo real

#### Manter Cenas
- **Adicionar**: cadastrar cena favorita com foto
- **Editar**: toque na cena para editar
- **Excluir**: pressione e segure para excluir
- Campos: filme*, título*, descrição*, observação, estrelas (0-5), foto*

---

## Tecnologias Utilizadas

- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **Supabase** - Backend (Auth, Database, Storage)
- **TypeScript** - Tipagem estática
- **React Navigation** - Navegação (Stack + Drawer)

## Como Executar

### Pré-requisitos
- Node.js instalado
- Expo Go no celular (Android/iOS)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/IF-Resenhas.git

# Entre na pasta
cd IF-Resenhas

# Instale as dependências
npm install

# Inicie o projeto
npx expo start
```

### Configuração do Supabase

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Execute o SQL de criação das tabelas (veja abaixo)
4. Crie um bucket `imagens` no Storage (público)
5. Atualize as credenciais em `js/supabase.ts`

<details>
<summary>SQL para criar as tabelas</summary>

```sql
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    datanasc TEXT
);

CREATE TABLE public.filmes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    genero TEXT,
    sinopse TEXT,
    datalancamento TEXT,
    urlfoto TEXT
);

CREATE TABLE public.resenhas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    id_filme UUID REFERENCES public.filmes(id) ON DELETE SET NULL,
    titulo TEXT NOT NULL,
    texto TEXT,
    estrelas INTEGER DEFAULT 0
);

CREATE TABLE public.cenas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    id_filme UUID REFERENCES public.filmes(id) ON DELETE SET NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    observacao TEXT,
    estrelas INTEGER DEFAULT 0,
    urlfoto TEXT
);

-- Segurança (RLS)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resenhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cenas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_policy" ON public.usuarios FOR ALL USING (auth.uid() = id);
CREATE POLICY "filmes_policy" ON public.filmes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "resenhas_policy" ON public.resenhas FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "cenas_policy" ON public.cenas FOR ALL USING (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.filmes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resenhas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cenas;
```

</details>

## Estrutura do Projeto

```
IF-Resenhas/
├── assets/              # Imagens e ícones
├── components/          # Componentes reutilizáveis
├── js/
│   ├── supabase.ts     # Configuração do Supabase
│   └── style.js        # Estilos globais
├── model/              # Classes de modelo
│   ├── Filme.tsx
│   ├── Resenha.tsx
│   ├── Cena.tsx
│   └── Usuario.tsx
├── screens/
│   ├── Login.tsx
│   ├── Registro.tsx
│   ├── Menu.tsx
│   ├── Filme/
│   │   ├── Listar.tsx
│   │   └── Manter.tsx
│   ├── Resenha/
│   │   ├── Listar.tsx
│   │   └── Manter.tsx
│   └── Cena/
│       ├── Listar.tsx
│       └── Manter.tsx
├── App.tsx             # Navegador raiz
└── package.json
```

## Licença

Este projeto é de uso educacional.
