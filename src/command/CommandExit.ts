import { BaseCommand } from "../types/command";
import zod from "zod";

export interface ICommandOptionsExit {
  message?: string;
}

export class CommandExit extends BaseCommand<ICommandOptionsExit> {
  public readonly SCHEMA = zod.object({
    message: zod.string().default("Thank you for using MAS CLI. Goodbye!")
  });

  public constructor() {
    super("exit");
  }

  public execute(options: ICommandOptionsExit): void {
    console.log(this.SCHEMA.parse(options).message);
    process.exit(0);
  }

  protected configure(): void {
    this.command.description("Exit the CLI");
  }
}
