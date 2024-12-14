#!/usr/bin/env node

import { MasCLI } from "../command/MasCLI";

function main(): void {
    const mas = new MasCLI();
    mas.run();
}

main();