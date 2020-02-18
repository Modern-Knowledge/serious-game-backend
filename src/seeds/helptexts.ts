import { Helptext } from "../lib/models/Helptext";

const helptext = new Helptext();
helptext.id = 1;
helptext.name = "recipe";
helptext.text = `Bitte prägen Sie sich das obrige Rezept gut ein! ` +
    `Sie werden es in den nächsten Schritten benötigen. Klicken Sie auf 'Weiter', wenn Sie bereit sind`;

const helptext1 = new Helptext();
helptext1.id = 2;
helptext1.name = "helptext";
helptext1.text = `Hilfetext`;

export { helptext, helptext1 };
