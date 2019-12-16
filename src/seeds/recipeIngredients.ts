import { RecipeIngredient } from "../lib/models/RecipeIngredient";
import { egg, oil } from "./ingredients";
import { scrambledEgg } from "./recipes";

const recipeIngredient1 = new RecipeIngredient();
recipeIngredient1.recipeId = scrambledEgg.id;
recipeIngredient1.ingredientId = egg.id;

const recipeIngredient2 = new RecipeIngredient();
recipeIngredient2.recipeId = scrambledEgg.id;
recipeIngredient2.ingredientId = oil.id;

export {
    recipeIngredient1, recipeIngredient2
};
