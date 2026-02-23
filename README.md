# CineFy - App de Resenhas de Filmes

Aplicativo mobile para gerenciar sua coleção de filmes, escrever resenhas e catalogar cenas favoritas.

Desenvolvido com React Native + Expo e Supabase (autenticação, banco de dados e storage).

## Screenshots

_Em breve_

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
- Campos: filme*, título*, texto\*, estrelas (0-5)

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
