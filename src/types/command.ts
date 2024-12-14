import { Command } from 'commander';

export interface IBaseCommand {
    command: Command;
    configure(): void;
}