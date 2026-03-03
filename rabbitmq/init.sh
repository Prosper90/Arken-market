#!/bin/sh
set -e

mkdir -p /var/lib/rabbitmq

# Write cookie file with correct permissions before RabbitMQ starts
if [ -n "$RABBITMQ_ERLANG_COOKIE" ]; then
  echo -n "$RABBITMQ_ERLANG_COOKIE" > /var/lib/rabbitmq/.erlang.cookie
fi

chown -R rabbitmq:rabbitmq /var/lib/rabbitmq
chmod 700 /var/lib/rabbitmq
chmod 400 /var/lib/rabbitmq/.erlang.cookie

exec gosu rabbitmq docker-entrypoint.sh "$@"
