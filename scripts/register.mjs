// Lets Node run the project's TypeScript directly (node --import ./scripts/register.mjs ...), with the
// "@/" alias and extensionless imports the app uses. Development tooling only; nothing here ships.
import { register } from "node:module";

register("./resolve-hooks.mjs", import.meta.url);
