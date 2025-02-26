ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:${NODE_VERSION}-alpine AS development
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/package*.json ./
RUN npm install
COPY --from=builder /usr/src/app ./
CMD ["npm","run","start:dev"]

FROM node:${NODE_VERSION}-alpine AS production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /usr/src/app 
COPY --from=builder /usr/src/app/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/views ./views
COPY --from=builder /usr/src/app/proxies.txt ./proxies.txt
RUN chown -R appuser:appgroup /usr/src/app/dist /usr/src/app/public /usr/src/app/views /usr/src/app/proxies.txt
USER appuser
CMD ["npm" , "run" , "start:prod"]