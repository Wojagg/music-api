FROM node:18.18-alpine3.17

WORKDIR /var/app

COPY packages/music-service/package.json ./
COPY packages/music-service/package-lock.json ./
COPY packages/music-service/src src
COPY packages/music-service/tsconfig.json tsconfig.json

RUN npm ci
RUN npm start

EXPOSE 3000

ENTRYPOINT ["npm", "start"]
