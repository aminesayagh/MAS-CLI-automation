// src/command/MasCLI.ts
import { Command } from "commander";
import colors from "colors";
import inquirer from "inquirer";

import { CommandList } from "./CommandList";
import { CommandExit } from "./CommandExit";
import { CommandDoc } from "./CommandDoc";

import { CliCommandRegistry } from "./cli/CliCommandRegistry";
import { CliOptionPrompt } from "./cli/CliOptionPrompt";
import { CliExecutor } from "./cli/CliExecutor";
import { ICommandInfo, commandNameSchema } from "../types/command";

/**
 * Main CLI application class that orchestrates command registration,
 * user interaction, and command execution
 */
export class MasCLI {
  private readonly registry: CliCommandRegistry;

  public constructor() {
    this.registry = new CliCommandRegistry(new Command());
    this.registerCommands();
  }

  /**
   * Start the CLI application
   */
  public async run(): Promise<void> {
    try {
      const args = process.argv.slice(2);
      if (args.length == 0) {
        // No command specified - show interactive menu
        await this.runInteractiveMode();
      } else {
        // Command specified - use command line mode
        await this.runCommandLineMode(args);
      }
    } catch (error) {
      console.error(colors.red("An error occurred:"), error);
      process.exit(1);
    }
  }

  /**
   * Register all available CLI commands
   */
  private registerCommands(): void {
    this.registry.registerCommand(new CommandList());
    this.registry.registerCommand(new CommandDoc());
    this.registry.registerCommand(new CommandExit());
  }

  /**
   * Run CLI in interactive mode with menu
   */

  private async runInteractiveMode(): Promise<void> {
    console.log(
      colors.yellow(
        "\nWelcome to MAS CLI - Your Development Workflow Assistant\n"
      )
    );

    while (true) {
      const command = await this.promptCommand();
      if (!command) return;

      try {
        await this.handleCommandExecution(command);
        if (!(await this.promptContinue())) {
          break;
        }
      } catch (error) {
        await this.handleError(error);
      }
    }
    
  }

  /**
   * Run CLI in command line mode
   */
  private async runCommandLineMode(args: string[]): Promise<void> {
    const commandName = commandNameSchema.parse(args[0]);
    const commandInfo = this.registry.getCommand(commandName);

    if (!commandInfo) {
      console.error(colors.red(`Unknown command: ${commandName}`));
      console.log(colors.yellow("Available commands:"));
      this.registry.getAllCommands().forEach(([name, info]) => {
        console.log(
          `  ${colors.cyan(name.padEnd(15))} ${info.command.description()}`
        );
      });
      process.exit(1);
    }

    try {
      // Parse command line arguments using Commander
      commandInfo.command.parse(process.argv);
      const options = commandInfo.command.opts();
      await CliExecutor.executeCommand(commandInfo, options);
    } catch (error) {
      console.error(colors.red("Error executing command:"), error);
      process.exit(1);
    }
  }

  /**
   * Display interactive menu and handle command execution
   * @param showWelcome Whether to show welcome message
   */
  private async showInteractiveMenu(
    showWelcome: boolean = true
  ): Promise<void> {
    if (showWelcome) {
      console.log(
        colors.yellow(
          "\nWelcome to MAS CLI - Your Development Workflow Assistant\n"
        )
      );
    }

    const command = await this.promptCommand();
    if (!command) return;

    try {
      await this.handleCommandExecution(command);
      await this.promptContinue();
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Prompt user to select a command
   */
  private async promptCommand() {
    const choices = this.registry.getAllCommands().map(([name, info]) => ({
      name: `${colors.cyan(name.padEnd(15))} ${info.command.description()}`,
      value: name
    }));

    const { selectedCommand } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedCommand",
        message: "Please select a command to execute:",
        choices,
        pageSize: 10
      }
    ]);

    return this.registry.getCommand(selectedCommand);
  }

  /**
   * Handle command execution flow
   * @param commandInfo Command to execute
   */
  private async handleCommandExecution(
    commandInfo: ICommandInfo<unknown>
  ): Promise<void> {
    const options =
      commandInfo.command.options.length > 0
        ? await CliOptionPrompt.promptOptions(commandInfo.command)
        : {};

    await CliExecutor.executeCommand(commandInfo, options);
  }

  /**
   * Prompt user whether to continue using CLI
   */
  private async promptContinue(): Promise<boolean> {
    const { shouldContinue } = await inquirer.prompt([
      {
        type: "confirm",
        name: "shouldContinue",
        message: "Do you want to continue?",
        default: true
      }
    ]);

    if (!shouldContinue) {
      console.log(colors.yellow("\nThank you for using MAS CLI. Goodbye!\n"));
    }

    return shouldContinue;
  }

  /**
   * Handle command execution errors
   * @param error Error that occurred
   */
  private async handleError(error: unknown): Promise<void> {
    console.error(
      colors.red("\nAn error occurred while executing the command:"),
      error
    );
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}
