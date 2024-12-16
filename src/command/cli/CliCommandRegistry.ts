import { Command } from "commander";
import {
  IBaseCommand,
  CommandRegistry,
  ICommandInfo
} from "../../types/command";

/**
 * Manages the registration and storage of CLI commands
 */
export class CliCommandRegistry {
  private commandRegistry: CommandRegistry = new Map();
  private program: Command;

  public constructor(program: Command) {
    this.program = program;
    this.initializeProgram();
  }

  /**
   * Register a new command with the CLI
   * @param command Command instance to register
   */
  public registerCommand<T>(command: IBaseCommand<T>): void {
    this.commandRegistry.set(command.command.name(), {
      SCHEMA: command.SCHEMA,
      command: command.command,
      execute: command.execute as (options: unknown) => Promise<void>
    });
    this.program.addCommand(command.command);
  }

  /**
   * Get registered command by name
   * @param name Command name
   */
  public getCommand(name: string): ICommandInfo<unknown> | undefined {
    return this.commandRegistry.get(name);
  }

  /**
   * Get all registered commands
   */
  public getAllCommands(): [string, ICommandInfo<unknown>][] {
    return Array.from(this.commandRegistry.entries());
  }

  /**
   * Initialize the CLI program with basic configuration
   */
  private initializeProgram(): void {
    this.program
      .name("mas")
      .description("CLI automation tools for developers")
      .version("0.0.1");

    // Add help text for invalid commands
    this.program.on("command:*", () => {
      throw new Error(
        `Invalid command: ${this.program.args.join(" ")}\nSee --help for available commands.`
      );
    });
  }
}
