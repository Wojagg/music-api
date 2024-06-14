FROM redis:7.0.12-alpine

COPY ./infrastructure/redis/redis.conf /usr/local/etc/redis/redis.conf

ARG REDIS_PASS

RUN sed -i "s/REDIS_PASS/'"$REDIS_PASS"'/" /usr/local/etc/redis/redis.conf

CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]

EXPOSE 6379
