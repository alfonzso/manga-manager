FROM node:17.3.0-alpine3.13 as builder
WORKDIR /tmp/manga_manager/

RUN  apk add python3 alpine-sdk curl
COPY . /tmp/manga_manager/
RUN npm version && npm ci && npm run build

# remove development dependencies
RUN npm prune --production

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
