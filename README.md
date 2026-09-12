# ReCircula

O ReCircula é uma aplicação web desenvolvida com o objetivo de facilitar a divulgação e o reaproveitamento de materiais recicláveis.

A proposta é criar um espaço simples onde uma pessoa possa informar que possui determinado material disponível para reciclagem ou reaproveitamento, permitindo que outras pessoas visualizem essas publicações e demonstrem interesse.

O projeto foi desenvolvido como parte das atividades acadêmicas de Engenharia de Software, envolvendo desde a definição do problema e levantamento de requisitos até a implementação, integração com banco de dados e realização de testes.

## Objetivo

O principal objetivo do ReCircula é aproximar pessoas que possuem materiais recicláveis de pessoas interessadas em recebê-los ou reaproveitá-los.

A aplicação busca contribuir para a redução do descarte inadequado de resíduos e incentivar práticas relacionadas à sustentabilidade e à economia circular.

O projeto também possui relação com os Objetivos de Desenvolvimento Sustentável da ONU, principalmente:

- ODS 11: Cidades e Comunidades Sustentáveis
- ODS 12: Consumo e Produção Responsáveis

## Como funciona

O usuário pode cadastrar uma publicação informando dados sobre o material disponível.

Entre as informações utilizadas estão:

- Nome do usuário
- Bairro
- Categoria do material
- Quantidade
- Descrição

Depois de publicada, a informação aparece no feed da aplicação.

Os demais usuários podem visualizar as publicações, filtrar os materiais por categoria, demonstrar interesse, comentar e compartilhar uma publicação.

## Funcionalidades

### Publicação de materiais

O usuário pode cadastrar um material informando:

- Nome
- Bairro
- Categoria
- Quantidade
- Descrição

### Feed de publicações

As publicações cadastradas são apresentadas em formato de feed.

Quando o Firebase está configurado, os dados são carregados diretamente do Cloud Firestore.

### Categorias

O projeto trabalha atualmente com as seguintes categorias:

- Papel / Papelão
- Plástico
- Vidro
- Metal
- Orgânico para compostagem
- Eletrônico
- Óleo de cozinha

### Filtro por categoria

É possível filtrar as publicações de acordo com o tipo de material.

### Interesse

Cada publicação possui uma opção para demonstrar interesse no material.

### Comentários

Os usuários podem adicionar comentários às publicações.

### Compartilhamento

A aplicação possui uma função de compartilhamento utilizando os recursos disponíveis no navegador.

Quando o navegador oferece suporte ao compartilhamento nativo, a aplicação utiliza esse recurso. Caso contrário, existe uma alternativa utilizando a área de transferência.

### Estatísticas

O sistema apresenta informações gerais sobre as publicações, como:

- Quantidade de publicações
- Estimativa de materiais disponíveis
- Quantidade de bairros envolvidos

A estimativa de peso utiliza valores médios definidos para cada categoria.

## Tecnologias utilizadas

O projeto foi desenvolvido utilizando:

- HTML5
- CSS3
- JavaScript
- Firebase
- Cloud Firestore

## Estrutura do projeto

A estrutura principal do projeto é organizada da seguinte forma:

```text
ReCircula/
│
├── index.html
├── style.css
├── script.js
├── firebase-config.js
├── README.md
├── LICENSE
└── .gitignore
