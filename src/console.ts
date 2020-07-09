import './bootstrap';
import * as commands from './commands';
import {default as chalk} from 'chalk';

const command = process.argv[2] || null;

if (!command) {
    showAvaiableCommands();
}

// @ts-ignore
const commandKey: string | undefined = Object.keys(commands).find(c => commands[c].command === command)

if (!commandKey) {
    showAvaiableCommands();
}

// @ts-ignore
const commandInstance = new commands[commandKey];

commandInstance
    .run()
    .catch((error: any) => {
        console.error(error)
    });

function showAvaiableCommands() {
    console.log(chalk.green('Loopback Console'));
    console.log("");
    console.log(chalk.green('Avaiable Commands'));
    console.log("");

    for (const c of Object.keys(commands)){
        // @ts-ignore
        console.log(`- ${chalk.green(commands[c].command)} - ${commands[c].description}`)
    }
    console.log("");
    process.exit();
}
