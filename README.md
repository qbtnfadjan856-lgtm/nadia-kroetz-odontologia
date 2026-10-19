# Nadia Kroetz Odontologia

Site estático em HTML5, CSS3 e JavaScript puro, preparado para publicação na Vercel.

## Estrutura

```text
.
├── index.html                 # página inicial
├── public/
│   └── assets/images/         # imagens extraídas do HTML original
├── src/
│   ├── css/main.css           # blocos de CSS originais, mantidos na ordem
│   └── js/
│       ├── main.js            # carrossel, imagens/galeria e scripts originais
│       └── booking.js         # fluxo de agendamento original
├── vercel.json
└── README.md
```

As fotos originalmente embutidas em Base64 foram extraídas para arquivos locais sem recompressão. CSS e JavaScript foram externalizados preservando a ordem das regras e dos scripts para minimizar mudanças visuais e comportamentais.

## Executar localmente

Como não há etapa de compilação, sirva a raiz do projeto com qualquer servidor estático. Por exemplo, com Python instalado:

```bash
python -m http.server 8080
```

Abra `http://localhost:8080`.

> Não abra `index.html` diretamente via `file://`, porque caminhos absolutos e recursos de origem podem se comportar de forma diferente.

## Publicar na Vercel

1. Importe o repositório GitHub no painel da Vercel.
2. Em **Framework Preset**, selecione **Other**.
3. Deixe **Build Command** vazio e não defina diretório de saída (o `index.html` fica na raiz).
4. Faça o deploy. Commits na branch de produção serão publicados automaticamente conforme as configurações do projeto.

## Validação

- `node --check src/js/main.js` — sintaxe JavaScript verificada.
- `node --check src/js/booking.js` — sintaxe JavaScript verificada.
- Verificação visual por screenshots e testes no navegador ainda devem ser realizados após o primeiro deploy; portanto, a fidelidade visual em todas as resoluções não é declarada como validada.
