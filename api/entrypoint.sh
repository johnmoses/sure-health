#!/bin/sh

# if [ "$DATABASE" = "postgres" ]
# then
#     echo "Waiting for postgres..."

#     while ! nc -z $SQL_HOST $SQL_PORT; do
#       sleep 0.1
#     done

#     echo "PostgreSQL started"
# fi

# flask run --host=0.0.0.0

gunicorn wsgi:app -b "0.0.0.0:5001" -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1

exec "$@"