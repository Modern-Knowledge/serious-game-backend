# Serious Game Backend

Backend-Instanz of the serious game.

NodeJS + ExpressJS

## Getting Started

```
git clone https://github.com/Modern-Knowledge/serious-game-backend
cd serious-game-backend
```

### Prerequisites

#### Install NPM:
```
$ npm install npm@latest -g
```

#### MySQL-instance:
```
docker run --name serious-game-database -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -d mysql:5.7
```

### Installing

To run a locale instance, complete the following steps.

#### Create .env-file

```
cp .env.example .env
```
Fill in all values in the .env.


#### Install dependencies

```
npm install
```

### Run the project
```
npm run watch
```
