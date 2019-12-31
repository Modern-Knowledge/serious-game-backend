/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import {Image} from "../lib/models/Image";
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
    }

    return [image, image1, image2, image3, image4, image5, image6, image7, image8, image9, image10, image11, image12,
        image13, image14, image15, image16];
}

export {loadImages};
