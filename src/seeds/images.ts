import { Image } from "../lib/models/Image";
import { getImage, inTestMode } from "../util/Helper";

async function loadImages(): Promise<Image[]> {
    const image = new Image();
    image.id = 1;

    const image1 = new Image();
    image.id = 2;

    if (!inTestMode()) {
        image.image = await getImage("egg.png");
        image1.image = await getImage("oil.png");
    }

    return [image, image1];
}

export { loadImages };
