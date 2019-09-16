export class Stopwatch {
  private readonly _name: string;
  private _start: [number, number] = process.hrtime();

  public constructor(name: string) {
    this._name = name;
  }


  public getTimeElapsed(): string {
    const end = process.hrtime(this._start);
    return `${this._name}: ${Math.round((end[0] * 1000) + (end[1] / 1000000))}s`;
  }
}
