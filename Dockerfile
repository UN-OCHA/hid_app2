FROM unocha/alpine-nginx-extras:201610-PR95

RUN mkdir -p /srv/www

COPY ./src/html /srv/www/

COPY ./conf/nginx/default.conf /etc/nginx/conf.d/
