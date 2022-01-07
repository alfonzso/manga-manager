FROM node:17.3.0-alpine3.13 as builder

RUN  apk add python3 alpine-sdk curl
# RUN npm install -g @foal/cli typescript @types/node && apk add python3 alpine-sdk
WORKDIR /tmp/manga_manager/
# COPY package-lock.json package.json /tmp/manga_manager/
# RUN cd /tmp/manga_manager/ && npm install --production

COPY . /tmp/manga_manager/
COPY docker/node-prune.sh /usr/local/bin/node-prune.sh
# RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | sh -s -- -b /usr/local/bin
RUN npm ci && npm run build

# remove development dependencies
RUN npm prune --production

# run node prune
RUN /usr/local/bin/node-prune.sh

# FROM node:12-alpine
FROM node:17.3.0-alpine3.13

WORKDIR /opt/manga_manager

# copy from build image
COPY --from=builder /tmp/manga_manager/build/       ./build
COPY --from=builder /tmp/manga_manager/public       ./public
COPY --from=builder /tmp/manga_manager/config       ./config
COPY --from=builder /tmp/manga_manager/ormconfig.js ./
COPY --from=builder /tmp/manga_manager/node_modules ./node_modules

EXPOSE 3001

CMD ["node", "/opt/manga_manager/build/index.js"]

# FROM alpine:latest as prod
# RUN apk add --update nodejs npm sqlite
# # RUN npm install -g better-sqlite3 --save
# RUN addgroup -S node && adduser -S node -G node
# USER node

# RUN mkdir /home/node/manga_manager
# WORKDIR /home/node/manga_manager
# # COPY --chown=node:node package-lock.json package.json ./
# COPY --chown=node:node --from=builder /tmp/manga_manager/package-lock.json  /home/node/manga_manager/
# COPY --chown=node:node --from=builder /tmp/manga_manager/package.json       /home/node/manga_manager/
# COPY --chown=node:node --from=builder /tmp/manga_manager/build/.            /home/node/manga_manager/
# COPY --chown=node:node --from=builder /tmp/manga_manager/config             /home/node/manga_manager/config
# COPY --chown=node:node --from=builder /tmp/manga_manager/public             /home/node/manga_manager/public
# COPY --chown=node:node --from=builder /tmp/manga_manager/node_modules       /home/node/manga_manager/node_modules
# COPY --chown=node:node --from=builder /tmp/manga_manager/ormconfig.js       /home/node/manga_manager/ormconfig.js


# RUN npm ci

# COPY --chown=node:node . .

