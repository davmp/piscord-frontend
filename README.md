# Frontend Piscord

Aplicação frontend do Piscord, desenvolvida com Angular e integrações em tempo real via WebSocket.

## Executando o Frontend

A forma mais fácil de executar o frontend juntamente com o backend e as dependências é através do repositório principal de orquestração:

👉 [Clique para acessar o repositório principal de orquestração](https://github.com/davmp/piscord-app)

Lá você encontrará tudo para subir o ambiente completo usando Kubernetes.

## Tecnologias

- Angular 17+
- RxJS, Angular Material, PrimeNG
- WebSocket para mensagens em tempo real

## Docker & CI/CD

- Imagem Docker pronta para deploy
- CI/CD automatizado para publicação

## Variáveis de Ambiente (Docker)

Essas variáveis podem ser executadas ao executar seu container.

| Variável | Descrição                                       | Exemplo            |
| -------- | ----------------------------------------------- | ------------------ |
| API_URL  | URL do backend para conexões REST               | http://_host_/api  |
| WS_URL   | URL para conexão WebSocket em tempo real        | ws://_host_/api/ws |
| PORT     | Porta que o frontend irá escutar (padrão: 4000) | 4000               |

<!-- | NODE_ENV | Ambiente de execução (`production`, `development`) | production         | -->
