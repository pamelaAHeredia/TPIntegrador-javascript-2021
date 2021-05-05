FROM node:14-alpine

WORKDIR /app

COPY src/package*.json ./

RUN npm install && npm cache clean --force --loglevel=error

WORKDIR /app

COPY src/. .
