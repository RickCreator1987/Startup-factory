# syntax=docker/dockerfile:1
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

# non-root user for security
RUN addgroup -S signer && adduser -S signer -G signer
USER signer

ENV PORT=3001
EXPOSE 3001
CMD ["node", "server.js"]