import { Errortext } from "serious-game-library/dist/models/Errortext";
import { severityEasy } from "./severities";

const mealtimeError = new Errortext();
mealtimeError.id = 5;
mealtimeError.name = "mealtime";
mealtimeError.text =
    "::recipe:: ist keine gültige Mahlzeit für das ::mealtime::";
mealtimeError.severityId = severityEasy.id;

const mealtimeFilledError = new Errortext();
mealtimeFilledError.id = 6;
mealtimeFilledError.name = "mealtime-filled";
mealtimeFilledError.text =
    "::mealtime:: beinhaltet bereits ein Rezept! Bitte entfernen Sie zuerst das vorhandene Rezept.";
mealtimeFilledError.severityId = severityEasy.id;

const shoppingCartError = new Errortext();
shoppingCartError.id = 7;
shoppingCartError.name = "shopping-cart";
shoppingCartError.text = "Der Inhalt des Einkaufswagens ist nicht gültig!";
shoppingCartError.severityId = severityEasy.id;

const fridgeNotCheckedError = new Errortext();
fridgeNotCheckedError.id = 8;
fridgeNotCheckedError.name = "fridge-not-checked";
fridgeNotCheckedError.text = "Sehen sie zuerst im Kühlschrank nach!";
fridgeNotCheckedError.severityId = severityEasy.id;

const itemAlreadyInFridgeError = new Errortext();
itemAlreadyInFridgeError.id = 9;
itemAlreadyInFridgeError.name = "item-already-in-fridge";
itemAlreadyInFridgeError.text =
    "::item.name:: ist bereits im Kühlschrank vorhanden!";
itemAlreadyInFridgeError.severityId = severityEasy.id;

const shoppingListError = new Errortext();
shoppingListError.id = 10;
shoppingListError.name = "shopping-list";
shoppingListError.text = "Die Einkaufsliste ist nicht gültig!";
shoppingListError.severityId = severityEasy.id;

const dayPlanningError = new Errortext();
dayPlanningError.id = 11;
dayPlanningError.name = "day-planning";
dayPlanningError.text = "Der Tagesplan ist nicht gültig!";
dayPlanningError.severityId = severityEasy.id;

export {
    mealtimeError,
    mealtimeFilledError,
    shoppingCartError,
    fridgeNotCheckedError,
    itemAlreadyInFridgeError,
    shoppingListError,
    dayPlanningError
};
