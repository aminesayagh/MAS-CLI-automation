import inquirer from "inquirer";
import { Command } from "commander";

/**
 * Handles command option prompting and processing
 */
export class CliOptionPrompt {
  /**
   * Prompt for command options interactively
   * @param command Command to prompt options for
   */
  public static async promptOptions(
    command: Command
  ): Promise<Record<string, unknown>> {
    const questions = command.options.map(option =>
      this.createQuestion(option)
    );
    const answers = await inquirer.prompt(questions as any);

    return command.options.reduce(
      (options, option) => {
        const flags = option.flags.split(/[ ,|]+/);
        const longFlag =
          flags.find((f: string) => f.startsWith("--"))?.replace(/^--/, "") ||
          option.attributeName();
        options[option.attributeName()] = answers[longFlag];
        return options;
      },
      {} as Record<string, unknown>
    );
  }
  /**
   * Create inquirer questions from command options
   * @param option Command option to convert
   */
  private static createQuestion(option: any): Record<string, any> {
    const name = option.attributeName();
    const flags = option.flags.split(/[ ,|]+/);
    const longFlag =
      flags.find((f: string) => f.startsWith("--"))?.replace(/^--/, "") || name;

    const question = {
      name: longFlag,
      message: option.description || longFlag
    };

    return {
      ...question,
      ...CliOptionPrompt.determineQuestionType(option)
    };
  }

  /**
   * Determine the appropriate inquirer question type and properties
   * @param option Command option
   */
  private static determineQuestionType(option: any): Record<string, any> {
    if (option.mandatory) {
      return {
        type: "input",
        validate: (input: string) => input.length > 0
      };
    }

    if (typeof option.defaultValue === "boolean") {
      return {
        type: "confirm",
        default: option.defaultValue
      };
    }

    if (Array.isArray(option.defaultValue)) {
      return {
        type: "input",
        default: option.defaultValue.join(", "),
        filter: (input: string) => input.split(",").map(s => s.trim())
      };
    }

    return {
      type: "input",
      default: option.defaultValue
    };
  }
}
