import { Command } from "commander";
import colors from "colors";
import inquirer from "inquirer";

import { CommandList } from "./CommandList";
import { CommandExit } from "./CommandExit";
import { IBaseCommand, CommandRegistry } from "../types/command";

export class MasCLI {
  private program: Command;
  private commandRegistry: CommandRegistry;

  public constructor() {
    this.program = new Command();
    this.commandRegistry = new Map();
    this.initialize();
  }

  public async run(): Promise<void> {
    try {
      if (process.argv.length <= 2) {
        await this.showInteractiveMenu();
      } else {
        this.program.parse(process.argv);

        await this.showInteractiveMenu(false);
      }
    } catch (error) {
      console.error(colors.red("An error occurred:"), error);
      process.exit(1);
    }
  }

  private initialize(): void {
    this.program
      .name("mas")
      .description("CLI automation tools for developers")
      .version("0.0.1");

    // Register all commands
    this.registerCommand<{ all: boolean }>(new CommandList());
    // register exit command
    this.registerCommand(new CommandExit());

    // Add help text for when no command is provided
    this.program.on("command:*", () => {
      console.error(
        colors.red(
          "Invalid command: %s\nSee --help for a list of available commands."
        ),
        this.program.args.join(" ")
      );
      this.showInteractiveMenu();
    });
  }

  private registerCommand<T>(command: IBaseCommand<T>): void {
    this.commandRegistry.set(command.command.name(), {
      command: command.command,
      execute: command.execute as (options: unknown) => Promise<void>
    });
    this.program.addCommand(command.command);
  }

  private async showInteractiveMenu(withHello: boolean = true): Promise<void> {
    if (withHello) {
      console.log(
        colors.yellow(
          "\nWelcome to MAS CLI - Your Development Workflow Assistant\n"
        )
      );
    }

    const choices = Array.from(this.commandRegistry.entries()).map(
      ([name, info]) => ({
        name: `${colors.cyan(name.padEnd(15))} ${info.command.description()}`,
        value: name
      })
    );

    const { selectedCommand } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedCommand",
        message: "Please select a command to execute:",
        choices,
        pageSize: 10
      }
    ]);

    const commandInfo = this.commandRegistry.get(selectedCommand);
    if (commandInfo) {
      const { command } = commandInfo;

      try {
        // If command needs additional options, prompt for them
        if (command.options.length > 0) {
          const options = await this.promptCommandOptions(command);
          await commandInfo.execute?.(options);

          await this.showInteractiveMenu(false);
        } else {
          await commandInfo.execute?.({});
        }

        const { shouldContinue } = await inquirer.prompt([
          {
            type: "confirm",
            name: "shouldContinue",
            message: "Do you want to continue?",
            default: true
          }
        ]);

        if (!shouldContinue) {
          console.log(
            colors.yellow("\nThank you for using MAS CLI. Goodbye!\n")
          );
          process.exit(0);
        }
      } catch (error) {
        console.error(
          colors.red("\nAn error occurred while executing the command:"),
          error
        );
        await new Promise(resolve => setTimeout(resolve, 2000)); // Pause to show error
      }
    }
  }

  private async promptCommandOptions(
    command: Command
  ): Promise<ReturnType<typeof inquirer.prompt>> {
    const questions = command.options.map(option => {
      const question: {
        [x: string]: any;
      } = {
        name: option.attributeName(),
        message: option.description
      };

      if (option.mandatory) {
        question["type"] = "input";
        question["validate"] = (input: string) => input.length > 0;
      } else {
        question["type"] = "confirm";
        question["default"] = option.defaultValue;
      }

      return question;
    });

    return inquirer.prompt(
      questions as {
        [x: string]: any;
      }
    );
  }
}
