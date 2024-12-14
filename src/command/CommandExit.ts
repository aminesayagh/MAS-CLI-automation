import { Command } from "commander";
import { IBaseCommand } from "../types/command";

export interface ICommandOptionsExit {
  message?: string;
}

export class CommandExit implements IBaseCommand<ICommandOptionsExit> {
  public command: Command;

  public constructor() {
    this.command = new Command("exit");
  }

  public configure(): void {
    this.command.description("Exit the CLI");
  }

  public execute(options: ICommandOptionsExit): void {
    console.log(options.message || "Thank you for using MAS CLI. Goodbye!");
    process.exit(0);
  }
}
