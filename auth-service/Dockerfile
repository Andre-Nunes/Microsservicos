# auth-service/Dockerfile

# ---- Base Stage ----
# Usar uma imagem Node.js oficial e leve (Alpine é uma boa escolha para produção)
# Especificar uma versão LTS para maior estabilidade
FROM node:18-alpine AS base

# Definir o diretório de trabalho dentro do contentor
WORKDIR /usr/src/app

# ---- Dependencies Stage ----
# Copiar package.json e package-lock.json (ou yarn.lock)
# Esta layer só será reconstruída se estes ficheiros mudarem, aproveitando o cache do Docker
FROM base AS dependencies
COPY package*.json ./

# Instalar apenas as dependências de produção.
# O --omit=dev (ou --production para versões mais antigas do npm) é importante para manter a imagem pequena.
RUN npm ci --omit=dev

# ---- Build Stage (opcional, mais útil se tiver um passo de build como transpilação TypeScript) ----
# Se o seu projeto Node.js for JavaScript puro e não tiver um passo de build, pode saltar esta stage
# ou usá-la para copiar o código fonte.
# FROM base AS build
# WORKDIR /usr/src/app
# COPY --from=dependencies /usr/src/app/node_modules ./node_modules
# COPY . .
# RUN npm run build # Se tivesse um script de build no seu package.json

# ---- Production Stage ----
# Começar de uma imagem base limpa para a imagem final
FROM base AS production

# Copiar as dependências instaladas da stage 'dependencies'
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# Copiar o código da aplicação
# Se tivesse uma stage 'build' com artefactos, copiaria de lá.
# Como é JS puro, copiamos o código fonte.
COPY . .

# Expor a porta que a aplicação Express escuta dentro do contentor
# Esta porta deve corresponder à que está no seu server.js (ex: process.env.AUTH_SERVICE_PORT || 3002)
# O ficheiro .env não será copiado para a imagem, então as variáveis de ambiente
# precisarão ser fornecidas ao contentor em runtime (ex: via Kubernetes ConfigMaps/Secrets ou docker run -e)
# Mas o EXPOSE aqui é mais para documentação e para o Docker saber qual porta a app usa.
EXPOSE 3002 

# Opcional: Criar um utilizador não-root para executar a aplicação (boa prática de segurança)
# RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# USER appuser
# Se fizer isto, certifique-se que o utilizador appuser tem permissões para ler/executar os ficheiros.
# Por simplicidade inicial, podemos omitir isto, mas é recomendado para produção.
# O utilizador 'node' já existe em muitas imagens Node.js e pode ser usado:
USER node

# Comando para executar a aplicação quando o contentor iniciar
# server.js é o ponto de entrada da sua aplicação Express
CMD [ "node", "server.js" ]