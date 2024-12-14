import { Command } from "commander";

export interface IBaseCommand<T> {
  command: Command;
  configure: () => void;
  execute: (options: T) => Promise<void> | void;
}

export interface ICommandInfo<T> {
  command: Command;
  execute: (options: T) => Promise<void>;
}

export type CommandRegistry = Map<string, ICommandInfo<unknown>>;
