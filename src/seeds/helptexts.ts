import { Helptext } from "serious-game-library/dist/models/Helptext";

const helptext = new Helptext();
helptext.id = 1;
helptext.name = "day-planning";
helptext.text = `Ordnen Sie die untenstehenden Rezepte den richtigen Tageszeiten zu. Dafür wählen Sie das jeweilige `
 + `Rezept und ziehen es mit dem Finger in das Frühstück, Mittag- oder Abendessen. Wenn Sie nicht wissen, zu welcher  `
 + `Tageszeit die Rezepte gehören, können Sie im Hauptmenü unter dem Punkt 'Rezepte' alles nachlesen. ` +
    `Nachdem Sie ein paar Rezepte den Tageszeiten zugewiesen haben, klicken Sie auf 'Weiter'. Danach wird ein ` +
    `zufälliges Rezept aus den Zugewiesenen gewählt.`;

const helptext1 = new Helptext();
helptext1.id = 2;
helptext1.name = "recipe";
helptext1.text = `Bitte prägen Sie sich das unten stehende Rezept gut ein! ` +
    `Sie werden es in den nächsten Schritten benötigen. Klicken Sie auf 'Weiter', wenn Sie bereit sind.`;

const helptext2 = new Helptext();
helptext2.id = 3;
helptext2.name = "shopping-list";
helptext2.text = `Sehen Sie zuerst im Kühlschrank nach, welche Zutaten Sie bereits zu Hause haben. Wenn Sie ` +
    `schon eine Zutat aus der Einkaufsliste besitzen, müssen Sie diese nicht mehr kaufen. Ziehen Sie mit dem ` +
    `Finger die fehlenden Zutaten für Ihr Rezept in das Feld 'Einkaufsliste'. Wenn Sie denken, dass die ` +
    `Einkaufsliste vollständig ist, dann klicken Sie auf 'Weiter'.`;

const helptext3 = new Helptext();
helptext3.id = 4;
helptext3.name = "shopping-center";
helptext3.text = `Suchen Sie nun in den Regalen nach den Zutaten, die Sie auf die Einkaufsliste geschrieben haben. ` +
    `Die verschiedenen Zutaten sind in Kategorien unterteilt. Klicken Sie auf das gewünschte Regal. Ziehen Sie ` +
    `danach die richtige Zutat in den Einkaufswagen. Wenn Sie die falsche Zutat in den Einkaufswagen gelegt ` +
    `haben, dann gehen Sie wieder in das Regal und ziehen die Zutat zurück. Wenn Sie alle benötigen Zutaten ` +
    `eingekauft haben, dann klicken Sie auf 'Fertigstellen'.`;

export { helptext, helptext1, helptext2, helptext3 };
