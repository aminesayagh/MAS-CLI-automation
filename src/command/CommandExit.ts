import { Command } from "commander";
import { IBaseCommand } from "../types/command";

export class CommandExit implements IBaseCommand<void> {
  public command: Command;

  public constructor() {
    this.command = new Command("exit");
  }

  public configure(): void {
    this.command.description("Exit the CLI");
  }

  public execute(): void {
    process.exit(0);
  }
}
