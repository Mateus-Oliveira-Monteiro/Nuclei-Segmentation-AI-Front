# Nuclei Segmentation AI - Frontend

Aplicacao web em React para autenticar usuarios, selecionar imagens de microscopia ou enviar arquivos, solicitar a segmentacao ao backend e visualizar os resultados morfometricos.

## Visao geral

O frontend e uma SPA criada com Vite e React 19. Ele nao executa o modelo de inteligencia artificial no navegador. Seu papel e oferecer a interface e consumir a API Flask do backend.

O usuario pode:

- entrar usando a credencial configurada no ambiente do backend;
- selecionar uma imagem predefinida;
- enviar TIFF, PNG ou JPEG de ate 50 MB;
- acompanhar o processamento;
- visualizar a contagem de nucleos, estatisticas, overlay e histograma;
- baixar o CSV, a imagem segmentada e o histograma.

## Arquitetura e fluxo

```text
Navegador
	|
	| login e token Bearer
	v
Frontend React + Vite
	|
	| POST /api/segment ou /api/upload-and-segment
	v
Backend Flask + StarDist
	|
	| overlay, histograma, CSV e estatisticas
	v
Azure Blob Storage ou armazenamento local do backend
```

### Inicializacao

1. `main.jsx` monta o componente `App`.
2. `App` procura um token de sessao salvo no `localStorage`.
3. Quando existe token, o frontend chama `GET /api/verify-token`.
4. Token invalido ou expirado remove a sessao e exibe a tela de login.
5. Token valido libera o painel de analise.

### Analise de imagem predefinida

1. O usuario escolhe uma amostra.
2. O frontend envia `image_name` para `POST /api/segment`.
3. O backend carrega o TIFF cadastrado e executa a inferencia StarDist.
4. O frontend renderiza os dados retornados e monta as URLs dos resultados.

### Upload de arquivo

1. O usuario seleciona ou arrasta um arquivo para a area de upload.
2. O componente valida extensao e tamanho antes do envio.
3. O frontend envia o arquivo no campo multipart `file` para `POST /api/upload-and-segment`.
4. O backend processa o arquivo temporario e retorna os mesmos tipos de resultado.

## Autenticacao no frontend

O frontend nao contem senha, connection string ou chave privada. A credencial e validada exclusivamente pelo backend.

Depois do login, o token retornado e salvo em `localStorage` com a chave `nuclei_auth_token` e enviado assim:

```text
Authorization: Bearer <TOKEN_DE_SESSAO>
```

O token deve ser tratado como dado sensivel. Nao o inclua em screenshots, logs, issues, commits ou documentacao.

## Configuracao da API

Crie um arquivo `.env` local a partir de `.env.example`:

```bash
cp .env.example .env
```

Configure apenas a URL publica do backend:

```text
VITE_API_BASE_URL=http://localhost:5000
```

Para producao, use a URL do App Service ou gateway do backend. O valor e incorporado no bundle durante o build, portanto nao coloque nessa variavel nenhum segredo.

O Vite disponibiliza ao frontend somente variaveis iniciadas por `VITE_`. Chaves de Azure, senhas, tokens de longa duracao e connection strings nunca devem ser adicionados a esse arquivo.

## Estrutura do projeto

```text
.
├── index.html                 # Documento HTML inicial
├── package.json               # Dependencias e scripts
├── vite.config.js             # Configuracao do Vite
├── eslint.config.js           # Regras do ESLint
├── .env.example               # Exemplo sem segredos
├── public/                    # Arquivos publicos estaticos
└── src/
	 ├── main.jsx               # Entrada da aplicacao
	 ├── App.jsx                # Estado, autenticacao, chamadas e resultados
	 ├── App.css                # Layout, componentes e tema visual
	 ├── index.css              # Reset e estilos globais
	 ├── components/
	 │   ├── Login.jsx          # Formulario de autenticacao
	 │   └── ImageUpload.jsx     # Upload, drag-and-drop e validacao
	 └── assets/images/
		  └── tiff images/       # Previews PNG das imagens predefinidas
```

## Estado da aplicacao

`App.jsx` controla:

- `authToken`: token atual da sessao;
- `activeTab`: modo de imagem predefinida ou upload;
- `selectedPreset`: imagem cadastrada selecionada;
- `uploadedFile`: arquivo escolhido pelo usuario;
- `isLoading`: bloqueia a interface durante a requisicao;
- `result`: resposta de sucesso da API;
- `error`: mensagem apresentada quando a requisicao falha.

O componente `ImageUpload` tambem valida:

- extensoes `.tif`, `.tiff`, `.png`, `.jpg` e `.jpeg`;
- tamanho maximo de 50 MB;
- selecao por dialogo ou arrastar e soltar;
- remocao do arquivo antes do processamento.

## Contrato consumido da API

### Login

`POST /api/login` recebe a credencial digitada pelo usuario e retorna um token. O frontend nao conhece nem documenta o valor dessa credencial.

### Imagem predefinida

```http
POST /api/segment
Authorization: Bearer <TOKEN_DE_SESSAO>
Content-Type: application/json
```

```json
{"image_name": "Campo 1"}
```

### Upload

```http
POST /api/upload-and-segment
Authorization: Bearer <TOKEN_DE_SESSAO>
Content-Type: multipart/form-data
```

Campo enviado: `file`.

### Resposta usada na interface

```json
{
  "success": true,
  "image_name": "Campo 1",
  "nuclei_count": 223,
  "statistics": {
	 "mean_area": 0,
	 "median_area": 0,
	 "min_area": 0,
	 "max_area": 0,
	 "std_area": 0,
	 "mean_diameter": 0,
	 "mean_solidity": 0
  },
  "result_image_url": "<URL_DO_OVERLAY>",
  "histogram_url": "<URL_DO_HISTOGRAMA>",
  "csv_download_url": "<URL_DO_CSV>",
  "nuclei_data": []
}
```

Quando a API retorna um caminho relativo, `App.jsx` o combina com `VITE_API_BASE_URL`. URLs absolutas sao usadas diretamente.

## Tema e experiencia visual

O tema atual usa superficies escuras grafite, azul ardosia para acoes principais, verde suave para estados positivos e cobre discreto para atencao. O layout foi mantido responsivo para telas menores, com estados visuais para:

- login e sessao autenticada;
- abas e selecao de amostras;
- drag-and-drop;
- processamento em andamento;
- erro de validacao ou comunicacao;
- resultados e downloads.

## Desenvolvimento local

Requisitos: Node.js compativel com Vite 6.

```bash
npm install
npm run dev
```

Abra a URL indicada pelo Vite. O backend tambem precisa estar executando e ser acessivel pela URL configurada em `VITE_API_BASE_URL`.

## Scripts

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento com hot reload. |
| `npm run build` | Gera o bundle de producao em `dist/`. |
| `npm run preview` | Serve localmente o bundle de producao. |
| `npm run lint` | Executa o ESLint. |

## Deploy no Azure Static Web Apps

1. Configure o pipeline para usar `Nuclei-Segmentation-AI-Front` como diretorio da aplicacao.
2. Defina a variavel `VITE_API_BASE_URL` nas configuracoes do ambiente de build.
3. Execute `npm run build` no pipeline.
4. Publique o diretorio `dist/` gerado pelo Vite.
5. Garanta que o backend permita requisicoes CORS do dominio publicado.
6. Teste login, upload, imagem predefinida e downloads apos a publicacao.

Nao coloque segredos nas variaveis `VITE_*`: elas ficam visiveis no JavaScript entregue ao navegador.

## Diagnostico

- `401`: token ausente, invalido ou expirado; faca login novamente.
- Erro de rede: confira `VITE_API_BASE_URL`, disponibilidade do backend e CORS.
- Upload rejeitado: confira extensao e limite de 50 MB.
- Resultado sem imagem: verifique se as URLs retornadas pela API sao acessiveis pelo navegador.
- Alteracao no `.env` sem efeito: reinicie o Vite, pois as variaveis sao lidas durante o build.

## Seguranca

- Nao commite `.env`.
- Nao inclua senhas, tokens, connection strings ou chaves de API no frontend.
- Considere o token salvo no navegador como dado sensivel.
- Use HTTPS no frontend e no backend em producao.
- Restrinja CORS ao dominio oficial do frontend.
