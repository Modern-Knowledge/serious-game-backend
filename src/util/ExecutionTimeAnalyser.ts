/**
 * analyses execution time based on environment variables
 * prints warnings and errors if execution time is to high
 */
import logger from "./logger";
import { Helper } from "./Helper";

export class ExecutionTimeAnalyser {

    private readonly _warnExecutionTime: number;
    private readonly _maxExecutionTime: number;

    public constructor() {
        this._warnExecutionTime = Number(process.env.WARN_EXECUTION_TIME) || 100;
        this._maxExecutionTime = Number(process.env.MAX_EXECUTION_TIME) || 500;
    }

    /**
     *
     * @param executionTime
     */
    public analyse(executionTime: number): void {
        if (executionTime >= this._maxExecutionTime) {
            logger.error(`${Helper.loggerString(__dirname, ExecutionTimeAnalyser.name, "analyse")} This operation is non performant (${executionTime}ms)! Refactor this method!`);
        } else if (executionTime >= this._warnExecutionTime) {
            logger.warn(`${Helper.loggerString(__dirname, ExecutionTimeAnalyser.name, "analyse")} This operation takes very long (${executionTime}ms)! Consider refactoring this method!`);
        }
    }
}