/**
 * simple stopwatch to measure execution time
 * stopwatch is autostarted
 */
export class Stopwatch {
  private readonly _name: string;
  private _start: [number, number] = process.hrtime();

  /**
   * @param name
   */
  public constructor(name?: string) {
    if(name) {
      this._name = name;
    }
  }

  get measuredTime(): [number, number] {
    return process.hrtime(this._start);
  }

  /**
   * returns the elapsed time since the start in ms
   */
  get timeElapsed(): string {
    const end = this.measuredTime;
    return `${this._name ? this._name + ": " : ""}${Math.round(end[1]/1000000)}ms`;
  }
}
