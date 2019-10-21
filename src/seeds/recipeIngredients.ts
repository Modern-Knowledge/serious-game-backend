import { RecipeIngredient } from "../lib/models/RecipeIngredient";
import { scrambledEgg } from "./recipes";
import { egg, oil } from "./ingredients";

const recipeIngredient1 = new RecipeIngredient();
recipeIngredient1.recipeId = scrambledEgg.id;
recipeIngredient1.ingredientId = egg.id;

const recipeIngredient2 = new RecipeIngredient();
recipeIngredient2.recipeId = scrambledEgg.id;
recipeIngredient2.ingredientId = oil.id;

export { recipeIngredient1, recipeIngredient2 };