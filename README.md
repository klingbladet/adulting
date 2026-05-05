# Adulting


## How to run locally using Docker

run all of the commands in the same dir as the `docker-compose.yml` file.

with live reloading:
```sh
docker compose up --build --watch
```

stop running:
```
docker compose down
```

stop running and clear database:
```
docker compose down -v
```
