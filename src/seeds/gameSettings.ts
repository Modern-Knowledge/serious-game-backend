import { GameSetting } from "serious-game-library/dist/models/GameSetting";
import { difficultyEasy } from "./difficulties";
import { game, game2, game3, game4 } from "./games";

const gameSettings = new GameSetting();
gameSettings.id = 1;
gameSettings.gameId = game.id;
gameSettings.difficultyId = difficultyEasy.id;

const gameSettings1 = new GameSetting();
gameSettings.id = 2;
gameSettings1.gameId = game2.id;
gameSettings1.difficultyId = difficultyEasy.id;

const gameSettings2 = new GameSetting();
gameSettings.id = 3;
gameSettings2.gameId = game3.id;
gameSettings2.difficultyId = difficultyEasy.id;

const gameSettings3 = new GameSetting();
gameSettings.id = 4;
gameSettings3.gameId = game4.id;
gameSettings3.difficultyId = difficultyEasy.id;

export { gameSettings, gameSettings1, gameSettings2, gameSettings3 };
