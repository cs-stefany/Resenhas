# CineFy

Desenvolvi o CineFy como um acervo pessoal para quem gosta de cinema: cada usuário pode organizar títulos, registrar opiniões e guardar as cenas que mais marcaram. O aplicativo foi construído com React Native, Expo, TypeScript e Supabase.

## Testar no Android

[Baixar o APK do CineFy](https://github.com/cs-stefany/Resenhas/releases/latest/download/CineFy-v1.2.1.apk)

No celular Android, abra o link acima, baixe o arquivo e permita a instalação quando o sistema solicitar. O aplicativo é distribuído diretamente pelo GitHub, então o Android pode exibir um aviso sobre instalação de fonte externa.

O banco começa vazio: crie um nome de usuário e uma senha para começar a testar filmes, resenhas e cenas.

## O que funciona

- **Implementei autenticação por nome de usuário e senha**, com cadastro, login, sessão persistente e logout — eliminando a dependência de e-mail ou SMS e oferecendo acesso permanente em diferentes dispositivos.
- **Construí o gerenciamento completo de filmes**, com cadastro, edição e exclusão — permitindo que cada pessoa mantenha seu acervo organizado em um único lugar.
- **Modelei resenhas e cenas favoritas vinculadas a cada filme**, incluindo avaliações de zero a cinco estrelas — preservando o contexto das experiências e tornando os registros mais úteis.
- **Criei busca e filtros por gênero ou avaliação** — facilitando a localização de conteúdos mesmo quando a coleção cresce.
- **Integrei câmera, galeria e armazenamento de imagens** — deixando os registros mais pessoais e visualmente envolventes.
- **Adicionei sincronização em tempo real** — mantendo a interface atualizada imediatamente após mudanças nos dados.
- **Protegi as informações com autenticação e Row Level Security no Supabase** — garantindo que cada usuário acesse somente o próprio conteúdo.
- **Entreguei uma versão Android instalável e pronta para demonstração** — permitindo que recrutadores testem o produto real diretamente no celular, sem configurar o ambiente de desenvolvimento.
