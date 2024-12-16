import { Command } from "commander";
import zod from "zod";

export interface IBaseCommand<T> {
  SCHEMA: zod.ZodObject<zod.ZodRawShape>;
  command: Command;
  execute: (options: T) => Promise<void> | void;
}

export abstract class BaseCommand<T> implements IBaseCommand<T> {
  abstract readonly SCHEMA: zod.ZodObject<zod.ZodRawShape>;
  public readonly command: Command;

  public constructor(name: string) {
    this.command = new Command(name);
    this.configure();
  }

  public abstract execute(options: Partial<T>): Promise<void> | void;
  protected abstract configure(): void;
}

export interface ICommandInfo<T> {
  SCHEMA: zod.ZodObject<zod.ZodRawShape>;
  command: Command;
  execute: (options: T) => Promise<void>;
}

export type CommandRegistry = Map<string, ICommandInfo<unknown>>;
