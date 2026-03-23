# Estágio 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./
COPY tsconfig*.json ./

# Instala todas as dependências (incluindo devDependencies para o build)
RUN npm ci

# Copia o código fonte
COPY . .

# Compila a aplicação
RUN npm run build

# Remove dependências de desenvolvimento
RUN npm prune --production

# Estágio 2: Produção
FROM node:20-alpine
WORKDIR /app

# Define ambiente de produção
ENV NODE_ENV=production

# Copia apenas os arquivos necessários do estágio anterior
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Cria usuário não-root para segurança
USER node

EXPOSE 3000

CMD ["node", "dist/main"]
