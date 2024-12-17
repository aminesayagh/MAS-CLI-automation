#!/usr/bin/env node

import { MasCLI } from "../command/MasCLI";
import colors from "colors";

async function main(): Promise<void> {
  const mas = new MasCLI();
  await mas.run();
}

main().catch(error => {
  console.error(colors.red("An error occurred:"), error);
  process.exit(1);
});
