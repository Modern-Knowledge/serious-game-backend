import { Difficulties } from "../lib/enums/Difficulties";
import { Difficulty } from "../lib/models/Difficulty";

const difficultyEasy = new Difficulty();
difficultyEasy.id = 1;
difficultyEasy.difficulty = Difficulties.EASY;

const difficultyMedium = new Difficulty();
difficultyMedium.id = 2;
difficultyMedium.difficulty = Difficulties.MEDIUM;

const difficultyHard = new Difficulty();
difficultyHard.id = 3;
difficultyHard.difficulty = Difficulties.HARD;

export { difficultyEasy, difficultyMedium, difficultyHard };
