FROM node:22-bookworm-slim

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN npm install --global pnpm@11.21.0 --fetch-retries=5 --fetch-timeout=120000

# Copiamos primero los archivos de dependencias para aprovechar la caché.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --network-concurrency=4 --fetch-retries=5 --fetch-timeout=120000

# Copiamos configuración de Prisma.
COPY prisma ./prisma
COPY prisma7.config.ts ./

# Copiamos configuración de TypeScript/Nest.
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY nest-cli.json ./

# Copiamos el código fuente.
COPY src ./src

# Genera Prisma Client en src/generated/prisma.
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" pnpm exec prisma generate --config prisma7.config.ts

# Compila NestJS.
RUN pnpm run build

ENV NODE_ENV=production

EXPOSE 3000

# Primero aplica las migraciones existentes.
# Si son exitosas, inicia NestJS.
CMD ["sh", "-c", "pnpm exec prisma migrate deploy --config prisma7.config.ts && pnpm run start:prod"]