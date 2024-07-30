FROM node:18.18-alpine3.17

WORKDIR /var/app

COPY packages/music-auth/package.json ./
COPY packages/music-auth/package-lock.json ./
COPY packages/music-auth/src src
COPY packages/music-auth/tsconfig.json tsconfig.json

RUN npm ci

EXPOSE 3001

ENTRYPOINT ["npm", "start"]
