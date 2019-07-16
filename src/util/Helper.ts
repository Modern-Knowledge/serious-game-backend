export abstract class Helper {
  private constructor() {}

  /**
   *
   * @param directory
   * @param className
   * @param methodName
   * @param fileName
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
