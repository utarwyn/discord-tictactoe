FROM node:16-slim as base
LABEL maintainer="Utarwyn <maxime.malgorn@laposte.net>"

RUN mkdir /app && chown -R node:node /app
WORKDIR /app

####################################################################################################

FROM base as build

COPY --chown=node:node . /app
RUN yarn install --silent --pure-lockfile && yarn build && rm -rf node_modules && yarn install --production --silent --pure-lockfile && yarn cache clean

####################################################################################################

FROM base as release

COPY --from=build --chown=node:node /app .

USER node
ENV NODE_ENV=production
CMD ["yarn", "serve"]
