import { BakedQuery } from "./BakedQuery";
import { SQLParam } from "./SQLParam";

/**
 * sql queries with named parameters
 */
export abstract class NamedParameterizedQuery {

 protected constructor() {}

 /**
  * returns parameters with values for the query
  */
 public abstract getParameters(): SQLParam[];

 /**
  * returns a new baked query
  */
 public bake(): BakedQuery {
   return new BakedQuery(this);
 }

 /**
  * generates the final sql string
  */
 public abstract getSql(): string;
}
