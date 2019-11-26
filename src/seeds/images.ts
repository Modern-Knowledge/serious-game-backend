import { Image } from "../lib/models/Image";
import { getImage } from "../util/Helper";

const image = new Image();
image.id = 1;
getImage("malboro.png").then((value) => {
    image.image = value;
});

export { image };
