
/**
 * Simple stopwatch to measure execution times.
 * Thee Stopwatch is autostarted, if an instance is created.
 */
export class Stopwatch {
    private readonly _name: string;
    private _start: [number, number] = process.hrtime();

    /**
     * @param name name of the stopwatch
     */
    public constructor(name?: string) {
        if (name) {
            this._name = name;
        }
    }

    /**
     * Calculates the difference between the start of the watch and the time
     * when the function is called.
     */
    get measuredTime(): number {
        const end = process.hrtime(this._start);
        return Math.round(end[1] / 1000000);
    }

    /**
     * Returns the elapsed time since the start of the stopwatch.
     */
    get timeElapsed(): string {
        const time: number = this.measuredTime;
        return `${this._name ? this._name + ": " : ""}${time}ms`;
    }
}
