
FROM node:alpine as builder
WORKDIR /edoc_cli
COPY ./edoc_cli/package*.json ./
RUN npm install --legacy-peer-deps 
COPY ./edoc_cli ./
ENV NODE_OPTIONS="--localstorage-file=/tmp/node-localstorage.json"
RUN npm run build

FROM nginx:latest
COPY --from=builder /edoc_cli/build /usr/share/nginx/html
COPY ./edoc_cli/default.conf /etc/nginx/conf.d/default.conf

