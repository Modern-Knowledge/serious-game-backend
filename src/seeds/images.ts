import {Image} from "serious-game-library/dist/models/Image";
import {getImage, inTestMode} from "../util/Helper";

async function loadImages(): Promise<Image[]> {
    const image = new Image();
    image.id = 1;

    const image1 = new Image();
    image1.id = 2;

    const image2 = new Image();
    image2.id = 3;

    const image3 = new Image();
    image3.id = 4;

    const image4 = new Image();
    image4.id = 5;

    const image5 = new Image();
    image5.id = 6;

    const image6 = new Image();
    image6.id = 7;

    const image7 = new Image();
    image7.id = 8;

    const image8 = new Image();
    image8.id = 9;

    const image9 = new Image();
    image9.id = 10;

    const image10 = new Image();
    image10.id = 11;

    const image11 = new Image();
    image11.id = 12;

    const image12 = new Image();
    image12.id = 13;

    const image13 = new Image();
    image13.id = 14;

    const image14 = new Image();
    image14.id = 15;

    const image15 = new Image();
    image15.id = 16;

    const image16 = new Image();
    image16.id = 17;

    const image17 = new Image();
    image17.id = 18;

    const image18 = new Image();
    image18.id = 19;

    const image19 = new Image();
    image19.id = 20;

    const image20 = new Image();
    image20.id = 21;

    const image21 = new Image();
    image21.id = 22;

    const image22 = new Image();
    image22.id = 22;

    const image23 = new Image();
    image23.id = 23;

    const image24 = new Image();
    image24.id = 24;

    const image25 = new Image();
    image25.id = 25;

    const image26 = new Image();
    image26.id = 26;

    const image27 = new Image();
    image27.id = 27;

    const image28 = new Image();
    image28.id = 28;

    const image29 = new Image();
    image29.id = 29;

    const image30 = new Image();
    image30.id = 30;

    if (!inTestMode()) {
        image.image = await getImage("egg.png");
        image1.image = await getImage("oil.png");
        image2.image = await getImage("spinach.png");
        image3.image = await getImage("pork.png");
        image4.image = await getImage("potato.png");
        image5.image = await getImage("sauerkraut.png");
        image6.image = await getImage("beef.png");
        image7.image = await getImage("noodles.png");
        image8.image = await getImage("ham.png");
        image9.image = await getImage("cheese.png");
        image10.image = await getImage("paprika.png");
        image11.image = await getImage("dough.png");
        image12.image = await getImage("tomatosauce.png");
        image13.image = await getImage("salad.png");
        image14.image = await getImage("bun.png");
        image15.image = await getImage("onion.png");
        image16.image = await getImage("spaetzle.png");
        image17.image = await getImage("chips.png");
        image18.image = await getImage("chocolate.png");
        image19.image = await getImage("pistachios.png");
        image20.image = await getImage("pommes.png");
        image21.image = await getImage("wok.png");
        image22.image = await getImage("bread.png");
        image23.image = await getImage("icetea.png");
        image24.image = await getImage("orangejuice.png");
        image25.image = await getImage("water.png");
        image26.image = await getImage("zwieback.png");
        image27.image = await getImage("oatmeal.png");
        image28.image = await getImage("jam.png");
        image29.image = await getImage("butter.png");
        image30.image = await getImage("milk.png");
    }

    return [
        image, image1, image2, image3, image4, image5, image6, image7, image8, image9, image10, image11, image12,
        image13, image14, image15, image16, image17, image18, image19, image20, image21,
        image22, image23, image24, image25, image26, image27, image28, image29, image30
    ];
}

export {loadImages};
