import { Image } from "../lib/models/Image";
import {getImage, inTestMode} from "../util/Helper";

async function loadImages(): Promise<Image[]> {
    const image = new Image();
    image.id = 1;

    if (!inTestMode()) {
        image.image = await getImage("malboro.png");
    }

    return [image];
}

export { loadImages };
