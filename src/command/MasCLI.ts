import { Command } from "commander";
import colors from "colors";

import { CommandList } from "./CommandList";
import { IBaseCommand } from "../types/command";

export class MasCLI {
    private program: Command;
    private commands: Command[];

    constructor() {
        this.program = new Command();
        this.commands = [];
        this.initialize();
    }

    private initialize(): void {
        this.program.name("mas").description("CLI automation tools for developers").version("0.0.1");

        // Register all commands
        this.registerCommand(new CommandList());

        // Add help text for when no command is provided
        this.program.on("command:*", () => {
            console.error(colors.red("Invalid command: %s\nSee --help for a list of available commands."), this.program.args.join(" "));
            this.showHelp();
        });
    }

    private registerCommand(command: IBaseCommand): void {
        this.commands.push(command.command);
        this.program.addCommand(command.command);
    }

    private showHelp(): void {
        console.log(this.program.helpInformation());
        this.commands.forEach((command) => {
            console.log(colors.green(`${command.name()}: ${command.description()}`));
        });
        console.log(colors.green("Run 'mas <command> --help' for more information on a command."));
    }

    public run(): void {
        
        if (process.argv.length <= 2) {
            console.log(colors.yellow('\nWelcome to MAS CLI - Your Development Workflow Assistant\n'));
            this.showHelp();
            return;
        }

        this.program.parse(process.argv);
    }
}