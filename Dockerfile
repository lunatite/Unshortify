ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:${NODE_VERSION}-alpine as development
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/package*.json ./
RUN npm install
COPY --from=builder /usr/src/app ./
CMD ["npm","run","start:dev"]

FROM node:${NODE_VERSION}-alpine as production
WORKDIR /usr/src/app 
COPY --from=builder /usr/src/app/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/client ./client
CMD ["npm" , "run" , "start:prod"]