export abstract class Helper {
  private constructor() {}

  /**
   * creates a string for logging that can be used in the winston logger
   *
   * @param directory directory where the method is located
   * @param className class where the method is located
   * @param methodName method which is executed
   * @param fileName file where the method is executed (only if not in class)
   */
  public static loggerString(directory: string, className: string, methodName: string, fileName?: string): string {
    const dir: string[] = directory.split("dist/");
    let file: string = "";
    if (fileName) {
      file = fileName.split("dist/")[1];
    }

    return `${((dir[1] !== undefined) ? dir[1] : "") + "/" + className}${methodName !== "" ? "." : ""}${methodName}${file}:`;
  }
}
