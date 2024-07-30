FROM redis:7.0.12-alpine

COPY ./infrastructure/redis/redis.conf /usr/local/etc/redis/redis.conf

ARG CACHE_PASS
ARG CACHE_USER

RUN sed -i "s/CACHE_PASS/'"$CACHE_PASS"'/" /usr/local/etc/redis/redis.conf
RUN sed -i "s/CACHE_USER/'"$CACHE_USER"'/" /usr/local/etc/redis/redis.conf

CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]

EXPOSE 6379
