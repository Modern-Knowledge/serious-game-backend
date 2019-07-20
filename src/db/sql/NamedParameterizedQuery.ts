import { SQLParam } from "./SQLParam";
import { BakedQuery } from "./BakedQuery";

export abstract class NamedParameterizedQuery {

 protected constructor() {}

 public abstract getParameters(): SQLParam[];

 public bake(): BakedQuery {
   return new BakedQuery(this);
 }

 public abstract getSql(): string;

}
