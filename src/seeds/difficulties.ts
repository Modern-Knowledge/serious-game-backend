import { Difficulty } from "../lib/models/Difficulty";
import { Difficulties } from "../lib/enums/Difficulties";

const difficultyEasy = new Difficulty();
difficultyEasy.difficulty = Difficulties.EASY;

const difficultyMedium = new Difficulty();
difficultyMedium.difficulty = Difficulties.MEDIUM;

const difficultyHard = new Difficulty();
difficultyHard.difficulty = Difficulties.HARD;

export { difficultyEasy, difficultyMedium, difficultyHard };