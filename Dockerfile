FROM node:14-slim as base
LABEL maintainer="Utarwyn <maxime.malgorn@laposte.net>"

RUN mkdir /app && chown -R node:node /app
WORKDIR /app

####################################################################################################

FROM base as build

COPY --chown=node:node . /app
RUN npm install --silent
RUN npm run build

####################################################################################################

FROM base as release

COPY --from=build --chown=node:node /app .

USER node
ENV NODE_ENV=production
CMD ["npm", "run", "serve"]
