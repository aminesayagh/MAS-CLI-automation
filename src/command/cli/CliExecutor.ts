import colors from "colors";
import { ICommandInfo } from "../../types/command";

/**
 * Handles command execution and error handling
 */
export class CliExecutor {
  /**
   * Execute a command with given options
   * @param commandInfo Command information
   * @param options Command options
   */
  static async executeCommand(
    commandInfo: ICommandInfo<unknown>,
    options: Record<string, any>
  ): Promise<void> {
    try {
      const parsedOptions = commandInfo.SCHEMA.parse(options);
      await commandInfo.execute(parsedOptions);
    } catch (error) {
      console.error(colors.red("Error executing command:"), error);
      throw error;
    }
  }
}
