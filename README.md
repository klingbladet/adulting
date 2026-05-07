# Adulting


## How to run locally using Docker

run all of the commands in the same dir as the `docker-compose.yml` file.

with live reloading:
```sh
docker compose up --build --watch
```

stop running:
```sh
docker compose down
```

stop running and clear database:
```sh
docker compose down -v
```

## How to check logs from Docker

get container service names:
```sh
docker compose ps -a
```

check logs for that specific container using the name from SERVICE column:
```sh
docker compose logs SERVICE_NAME
```

`docker ps` also shows if if the containers are __healthy__. Every 5 seconds the container makes a http request
to itself checking if it returns 200. If it is not 200, or does not responds within 2 seconds, it is considered __unhealthy__.
