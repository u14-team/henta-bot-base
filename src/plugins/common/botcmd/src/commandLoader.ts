import BotcmdPlugin from './index';
import readdirp from 'readdirp';
import path from 'path';
import { promises as fs } from 'fs';
import vm from 'vm';

export default class CommandLoader {
  botcmdPlugin: BotcmdPlugin;
  aliases = new Map<string, any>();
  commands: Array<any>;

  constructor(botcmdPlugin: BotcmdPlugin) {
    this.botcmdPlugin = botcmdPlugin;
  }

  async loadCommands() {
    const commandList = await readdirp.promise(`${this.botcmdPlugin.henta.botdir}/src/commands`);
    this.commands = await Promise.all(commandList.map(v => this.loadCommand(v.fullPath)));
    await Promise.all(this.commands.map(v => v.init && v.init(this.botcmdPlugin.henta)));
    this.botcmdPlugin.henta.log(`Commands loaded successfully (${this.commands.length}).`);
  }

  async loadCommand(filePath) {  
    const compiledFilePath = path.extname(filePath) === '.ts'
      ? filePath.replace('/src/commands/', '/lib/commands/').replace('.ts', '.js')
      : filePath;

    // Я пытался..
    /*
    const iifeCode = `${await fs.readFile(compiledFilePath)}`;
    const script = new vm.Script(iifeCode, { filename: compiledFilePath });
    script.runInThisContext();
    */
    try {
      const commandModule = await import(compiledFilePath);
      const CommandClass = commandModule.default || commandModule;
      const command = new CommandClass();

      const tokens = compiledFilePath.split('/');
      command.type = tokens[tokens.length - 2];
      command.path = compiledFilePath;
      command.slug = path.basename(compiledFilePath, '.js');

      this.setCommandAliases(command);
      return command;
    } catch(error) {
      throw Error(`Command error (${path.basename(compiledFilePath, '.js')}):\n${error.stack}`);
    } 
  }

  setCommandAliases(command) {
    this.aliases.set(command.name, command);
    if (command.aliases) {
      command.aliases.forEach(v => { this.aliases.set(v, command); });
    }
  
    if (command.subcommands) {
      command.subcommands.forEach(v => {
        this.aliases.set(`${command.name} ${v.name}`, v);
        if (v.aliases) {
          v.aliases.forEach(v2 => { this.aliases.set(`${command.name} ${v2.name}`, v); });
        }
      });
    }
  }
}