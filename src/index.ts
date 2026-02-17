import { Command } from "commander";
import { listCommand } from "./commands/list.js";
import { addCommand } from "./commands/add.js";
import { deleteCommand } from "./commands/delete.js";

const program = new Command();
program.name("memo");

listCommand(program);
addCommand(program);
// searchCommand(program);
deleteCommand(program);
// openCommand(program);

program.parse();