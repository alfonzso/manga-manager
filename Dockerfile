FROM node:17.3.0-alpine3.13

WORKDIR /opt/mana_manager
RUN npm install -g @foal/cli typescript && apk add python3 alpine-sdk

COPY . /tmp/mana_manager/
RUN cd /tmp/mana_manager/ && npm install --production && npm run build

RUN cp -a /tmp/mana_manager/build/. /opt/mana_manager/

CMD ["node", "/opt/mana_manager/index.js"]
