FROM unocha/alpine-nodejs-builder AS builder

WORKDIR /src

COPY . .

RUN yarn --ignore-engines

RUN grunt --target=production

FROM unocha/nginx:1.14

RUN mkdir -p /srv/www/html

COPY --from=builder /src/dist /srv/www/html

COPY --from=builder /src/nginx.default.conf /etc/nginx/conf.d/default.conf
