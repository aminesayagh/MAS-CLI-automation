import colors from "colors";
import zod from "zod";
import fs from "fs/promises";
import path from "path";

import { BaseCommand } from "../types/command";
import { CommandName } from "../types/command";
import { withFallback } from "../types/zod";

interface IJob {
  id: number;
  name: CommandName;
  command: string;
  options: Record<string, unknown>;
  timestamp: string;
}

export interface ICommandOptionsJob {
  jobId?: number;
}

export class CommandJob extends BaseCommand<ICommandOptionsJob> {
  private readonly jobsFile = "masconf.json";

  public static readonly DEFAULT_CONFIG: ICommandOptionsJob = {
    jobId: undefined
  };

  public readonly SCHEMA = zod.object({
    jobId: zod.number().optional()
  });

  public constructor() {
    super("job");
  }

  public async execute(options: Partial<ICommandOptionsJob>): Promise<void> {
    try {
      const parsedOptions = this.SCHEMA.parse(options);

      if (parsedOptions.jobId !== undefined) {
        await this.executeJob(parsedOptions.jobId);
      } else if (this.hasJob()) {
      } else {
        console.log(
          colors.yellow(
            "No job ID specified. Please specify a job ID or use the --list option to view available jobs."
          )
        );
      }
    } catch (error) {
      console.error(colors.red("An error occurred:"), error);
      throw error;
    }
  }

  protected configure(): void {
    this.command
      .description("Run a job")
      .option("-i, --job-id <id>", "Execute a specific job by ID", value =>
        parseInt(value)
      );
  }

  private async readJobs(): Promise<IJob[]> {
    const jobsFile = path.join(process.cwd(), this.jobsFile);
    const jobs = await fs.readFile(jobsFile, "utf8");
    try {
      return JSON.parse(jobs);
    } catch (error) {
      console.error(colors.red("Error parsing jobs file:"), error);
      return [];
    }
  }

  private async getJob(jobId: number): Promise<IJob> {
    const jobs = await this.readJobs();
    const job = jobs.find(job => job.id === jobId);
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found`);
    }
    return job;
  }

  private async executeJob(jobId: number): Promise<void> {
    const job = await this.getJob(jobId);
    console.log(colors.green(`Executing job ${job.name} with ID ${job.id}`));
  }
}
