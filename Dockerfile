FROM node:12


WORKDIR '/app'

COPY package*.json ./

RUN npm i

USER root

COPY --chown=node:node . .

RUN npm run quick-build

CMD npm run serve