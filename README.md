# Serious Game Backend

Die Backend-Instanz des Serious Games.

NodeJS+ExpressJS

## Getting Started

```
git clone https://repo.inso.tuwien.ac.at/florian.mold/serious-game-backend
cd serious-game-backend
```

### Prerequisites

#### NPM installieren:
```
$ npm install npm@latest -g
```

#### MySQL-Instanz in Docker starten:
```
docker run --name serious-game-database -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -d mysql:5.7
```

### Installing

Um eine lokale Instanz zum laufen zu bringen, müssen folgende Schritte ausgeführt werden:

#### .env-Datei erstellen:

```
cp .env.example .env
```
Alle Daten in der .env-Datei dementsprechend ausfüllen.


#### Dependencies installieren:

```
npm install
```

#### Die Serious-Game-Library ins Projekt kopieren:

```
npm run build
```

### Das Projekt ausführen:
```
npm run watch
```