# api-gateway/Dockerfile)

# ---- Base Stage ----
# Usar uma imagem Node.js oficial e leve (Alpine é uma boa escolha para produção)
# Especificar uma versão LTS para maior estabilidade (ex: node:18-alpine ou node:20-alpine)
FROM node:18-alpine AS base

# Definir o diretório de trabalho dentro do contentor
WORKDIR /usr/src/app

# ---- Dependencies Stage ----
# Copiar package.json e package-lock.json (ou yarn.lock)
# Esta layer só será reconstruída se estes ficheiros mudarem, aproveitando o cache do Docker
FROM base AS dependencies
COPY package*.json ./

# Instalar apenas as dependências de produção.
RUN npm ci --omit=dev

# ---- Production Stage ----
# Começar de uma imagem base limpa para a imagem final
FROM base AS production
WORKDIR /usr/src/app

# Copiar as dependências instaladas da stage 'dependencies'
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# Copiar o código da aplicação
COPY src ./src
COPY server.js .
# Se tiver outros ficheiros/pastas na raiz que a aplicação precisa (ex: ficheiros de config não em src), copie-os também.

# Expor a porta que a aplicação Express escuta dentro do contentor
# !!!!! MUDE ESTA PORTA PARA CADA SERVIÇO !!!!!
EXPOSE 3000

# Usar o utilizador 'node'
USER node

# Comando para executar a aplicação quando o contentor iniciar
CMD [ "node", "server.js" ]
