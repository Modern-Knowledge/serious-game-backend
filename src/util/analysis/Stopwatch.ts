

/**
 * simple stopwatch to measure execution time
 * stopwatch is autostarted when instanced
 */
export class Stopwatch {
  private readonly _name: string;
  private _start: [number, number] = process.hrtime();

  /**
   * @param name
   */
  public constructor(name?: string) {
    if (name) {
      this._name = name;
    }
  }

  get measuredTime(): number {
    const end = process.hrtime(this._start);
    return Math.round(end[1] / 1000000);
  }

  /**
   * returns the elapsed time since the start in ms
   */
  get timeElapsed(): string {
    const time: number = this.measuredTime;
    return `${this._name ? this._name + ": " : ""}${time}ms`;
  }
}
