// custom loggin library to log all the api calls and verbose messages

import chalk from 'chalk';


export default class Logging {
    public static log = (args: any) => this.info(args)
    public static info = (args: any) => {
        return console.log(chalk.blue(`${new Date().toLocaleString()} [INFO]`), typeof args == 'string' ? chalk.blueBright(args) : args)
    }
    public static warn = (args: any) => {
        return console.log(chalk.yellow(`${new Date().toLocaleString()} [WARNING]`), typeof args == 'string' ? chalk.yellowBright(args) : args)
    }
    public static error = (args: any) => {
        return console.log(chalk.red(`${new Date().toLocaleString()} [ERROR]`), typeof args == 'string' ? chalk.redBright(args) : args)
    }
}