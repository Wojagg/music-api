## Description

Music-api is an API which allows you to store and categorize your track, album etc. descriptions and also 
connect it with Spotify API when provided with user credentials.

(Not in MVP atm) - there are plans to add a container which will house a spotify instance recognized as a
device with spotify and to allow controlling its player through the existing music-service to allow streaming music.

## General notes

In a specific package directory you can run rather standard npm commands like npm run test or npm run lint but to run
commands like that over all packages you will need to use the commands from the makefile.

## Installation

Run below command to install all dependencies in all packages

```bash
$ make install-all
```

To supply environment variables you need to create the .env file by copying the .env.dist file:

```bash
cp .env.dist .env
```

The .env.dist file is filled with environment variable placeholders for you to provide. For example:

```
DB_PASSWORD=__DB_PASSWORD__
DB_PORT=__DB_PORT__
```

should be changed to e.g.:

```
DB_PASSWORD=yourChosenPassword
DB_PORT=27017
```

## Running the app

Run command below to set up redis, mongodb, authentication service and music service:

```bash
sudo docker compose up
```

or if you are introducing changes:

```bash
sudo docker compose up --build
```

Without the --build flag the images will not be rebuilt every time you ran this command and the containers will spin up
without the changes you introduced.

## Authentication

To authenticate run a request provided below

```bash
curl --request POST \
  --url http://localhost:3001/auth/login \
  --header 'Content-Type: application/json' \
  --data '{
	"username": "admin",
	"password": "admin"
}'
```

With default data in mongodb, PASS_HASH=__PASS_HASH__ and JWT_SECRET=701b182a-83d4-4c0c-a09d-7aad7e91b7bc in .env file
this will give you JWT token authenticating you as an admin.

[//]: # (TODO: CHANGE PASS_HASH TO UUID OR JWT_SECRET TO A PLECOHOLDER FOR CONSISTENCY)

## Using the API

The communication with music-api itself made is using graphql - documentation for that is here

[//]: # (TODO: ADD A LINK TO "HERE" ABOVE WHEN GRAPHQL DOCS ARE READY)

## Test

To run all tests in all packages run:

```bash
$ make test-all
```
