# Nuclei-Segmentation AI Frontend

Interface web em React para selecionar imagens predefinidas e solicitar a segmentacao de nucleos via API, exibindo estatisticas e imagens resultantes.

## Visao geral

Este projeto entrega uma UI simples e responsiva para:

- Selecionar uma imagem de amostra (previews em PNG).
- Enviar o nome da imagem para uma API de segmentacao.
- Apresentar resultados numericos e imagens geradas pelo backend.

Ele foi criado com Vite + React 19, com foco em uma experiencia direta e visualmente clara.

## Fluxo do usuario

1. O usuario escolhe uma das imagens predefinidas (Campo 1, Campo 2, Campo 3, Campo 3R).
2. A interface envia um POST para a API com o campo `image_name`.
3. O frontend mostra estado de carregamento.
4. Ao retornar sucesso, a UI exibe:
	 - Quantidade de nucleos detectados.
	 - Estatisticas de area e morfologia.
	 - Imagem segmentada e histograma.
5. Em caso de erro, a UI exibe uma mensagem amigavel.

## Funcionalidades principais

- Selecao de imagens predefinidas com preview.
- Envio para analise via API REST.
- Estados de carregamento, erro e resultado.
- Exibicao de estatisticas com cards.
- Renderizacao das imagens resultantes geradas pelo backend.

## Estrutura do projeto

```
.
├─ index.html
├─ package.json
├─ vite.config.js
├─ eslint.config.js
├─ public/
└─ src/
	 ├─ main.jsx
	 ├─ App.jsx
	 ├─ App.css
	 ├─ index.css
	 └─ assets/
			└─ images/
				 └─ tiff images/
						├─ Campo 1.png
						├─ Campo 2.png
						├─ Campo 3.png
						└─ Campo 3R.png
```

### Responsabilidades por arquivo

- `src/main.jsx`: ponto de entrada, monta o React no DOM e carrega `index.css`.
- `src/App.jsx`: componente principal; controla estado da selecao, chamada a API e renderizacao dos resultados.
- `src/App.css`: estilos visuais do layout, cards, botoes, loading, resultados e responsividade.
- `src/index.css`: estilos base do template Vite (root, tipografia, botoes).
- `src/assets/images/tiff images/`: previews PNG usados nos botoes de selecao.

## Integracao com a API

- Base URL atual (fixa no codigo):
	- `https://nuclei-segmentation-ai-f7f3adfgb6ethuby.canadacentral-01.azurewebsites.net`

- Endpoint usado:
	- `POST /api/segment`

- Payload enviado:
	- `{ "image_name": "Campo 1" }` (o valor e o nome selecionado na UI)

- Resposta esperada (formato utilizado na UI):
	- `success`: boolean
	- `nuclei_count`: numero de nucleos detectados
	- `image_name`: identificador da imagem analisada
	- `statistics`: objeto com
		- `mean_area`, `median_area`, `min_area`, `max_area`, `std_area`
		- `mean_diameter`, `mean_solidity`
	- `result_image_url`: caminho da imagem segmentada
	- `histogram_url`: caminho do histograma

As imagens retornadas sao renderizadas concatenando a base URL com os caminhos fornecidos pela API.

## Estilo e UI

- Tema escuro com gradiente no fundo e cards translucidos.
- Botao selecionado recebe destaque visual com gradiente.
- Loading com spinner animado.
- Responsividade para telas menores via media query.

## Scripts

- `npm run dev`: inicia o servidor de desenvolvimento.
- `npm run build`: gera build de producao.
- `npm run preview`: serve o build localmente.
- `npm run lint`: roda o ESLint.

## Como rodar localmente

1. Instale as dependencias:
	 - `npm install`
2. Inicie o ambiente de desenvolvimento:
	 - `npm run dev`
3. Abra a URL exibida no terminal.

## Observacoes e limitacoes

- A lista de imagens e fixa; nao ha upload de arquivos no frontend.
- O endereco da API esta fixo em `src/App.jsx`. Para ambientes diferentes, recomenda-se mover para variaveis de ambiente do Vite.
- O campo `file` na lista de imagens nao e usado pelo frontend atualmente; o backend deve reconhecer o `image_name` enviado.

## Possiveis melhorias

- Substituir o base URL fixo por variavel `VITE_API_BASE_URL`.
- Adicionar upload de arquivos do usuario.
- Adicionar tratamento de erros mais detalhado (timeouts, mensagens por status HTTP).
- Exibir a imagem original junto da segmentada para comparacao.
