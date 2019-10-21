import { Game } from "../lib/models/Game";

const game = new Game();
game.id = 1;
game.name = "Tagesplanung";
game.description = "Planen Sie ihren Tag";
game.component = "day-planning";

const game2 = new Game();
game2.id = 2;
game2.name = "Rezept";
game2.description = "Merken Sie sich das Rezept.";
game2.component = "recipe";

const game3 = new Game();
game3.id = 3;
game3.name = "Einkaufsliste";
game3.description = "Erstellen Sie die Einkaufsliste.";
game3.component = "shopping-list";

const game4 = new Game();
game4.id = 4;
game4.name = "Einkaufszentrum";
game4.description = "Kaufen Sie ein.";
game4.component = "shopping-center";

export { game, game2, game3, game4 };