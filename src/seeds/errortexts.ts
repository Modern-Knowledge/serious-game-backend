import { Errortext } from '../lib/models/Errortext';
import { severityEasy } from './severities';

const mealtimeError = new Errortext();
mealtimeError.id = 3;
mealtimeError.name = "mealtime";
mealtimeError.text =
  "::recipe:: ist keine gültige Mahlzeit für das ::mealtime::";
mealtimeError.severityId = severityEasy.id;

const shoppingCartError = new Errortext();
shoppingCartError.id = 4;
shoppingCartError.name = "shopping-cart";
shoppingCartError.text = "Der Inhalt des Einkaufswagens ist nicht gültig!";
shoppingCartError.severityId = severityEasy.id;

const fridgeNotCheckedError = new Errortext();
fridgeNotCheckedError.id = 5;
fridgeNotCheckedError.name = "fridge-not-checked";
fridgeNotCheckedError.text = "Sehen sie zuerst im Kühlschrank nach!";
fridgeNotCheckedError.severityId = severityEasy.id;

const itemAlreadyInFridgeError = new Errortext();
itemAlreadyInFridgeError.id = 6;
itemAlreadyInFridgeError.name = "item-already-in-fridge";
itemAlreadyInFridgeError.text =
  "::item.name:: ist bereits im Kühlschrank vorhanden!";
itemAlreadyInFridgeError.severityId = severityEasy.id;

export {
  mealtimeError,
  shoppingCartError,
  fridgeNotCheckedError,
  itemAlreadyInFridgeError
};
