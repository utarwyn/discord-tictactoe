FROM node:26-alpine AS base
WORKDIR /app

FROM base AS deps
COPY --from=ghcr.io/pnpm/pnpm:12-alpine /opt/pnpm /opt/pnpm
RUN for bin in pnpm pn pnpx pnx; do ln -s "/opt/pnpm/$bin" "/usr/local/bin/$bin"; done
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

FROM deps AS prod-deps
RUN pnpm install --prod --frozen-lockfile

FROM deps AS build
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM base AS runtime
LABEL maintainer="Utarwyn <maxime.malgorn@laposte.net>"

ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=build /app/config/locales /app/config/locales

USER node
CMD ["node", "dist/bin/tictactoe.js"]
