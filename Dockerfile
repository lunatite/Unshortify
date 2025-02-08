ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
RUN npm run build

FROM node:${NODE_VERSION}-alpine as development
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/package*.json ./
RUN npm install
COPY --from=builder /usr/src/app ./
EXPOSE 3000
CMD ["npm","run","start:dev"]

# COPY . .
# RUN npm run build

# FROM node:${NODE_VERSION}-alpine as production
# WORKDIR /usr/src/app

# COPY --from=builder /usr/src/app/package*.json ./
# COPY --from=builder /usr/src/app/dist ./dist
# COPY --from=builder /usr/src/app/client ./client

# RUN npm install --production

# CMD ["node", "dist/main.js"]
