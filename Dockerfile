FROM node:20-slim as base
LABEL maintainer="Utarwyn <maxime.malgorn@laposte.net>"

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN pnpm install --prod --frozen-lockfile

FROM base AS build
RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

ENV NODE_ENV=production
CMD ["pnpm", "serve"]
