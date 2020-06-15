"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const readdirp_1 = __importDefault(require("readdirp"));
const path_1 = __importDefault(require("path"));
class CommandLoader {
    constructor(botcmdPlugin) {
        this.aliases = new Map();
        this.botcmdPlugin = botcmdPlugin;
    }
    async loadCommands() {
        const commandList = await readdirp_1.default.promise(`${this.botcmdPlugin.henta.botdir}/src/commands`);
        this.commands = await Promise.all(commandList.map(v => this.loadCommand(v.fullPath)));
        await Promise.all(this.commands.map(v => v.init && v.init(this.botcmdPlugin.henta)));
        this.botcmdPlugin.henta.log(`Commands loaded successfully (${this.commands.length}).`);
    }
    async loadCommand(filePath) {
        const compiledFilePath = path_1.default.extname(filePath) === '.ts'
            ? filePath.replace('/src/commands/', '/lib/commands/').replace('.ts', '.js')
            : filePath;
        // Я пытался..
        /*
        const iifeCode = `${await fs.readFile(compiledFilePath)}`;
        const script = new vm.Script(iifeCode, { filename: compiledFilePath });
        script.runInThisContext();
        */
        try {
            const commandModule = await Promise.resolve().then(() => __importStar(require(compiledFilePath)));
            const CommandClass = commandModule.default || commandModule;
            const command = new CommandClass();
            const tokens = compiledFilePath.split('/');
            command.type = tokens[tokens.length - 2];
            command.path = compiledFilePath;
            command.slug = path_1.default.basename(compiledFilePath, '.js');
            this.setCommandAliases(command);
            return command;
        }
        catch (error) {
            throw Error(`Command error (${path_1.default.basename(compiledFilePath, '.js')}):\n${error.stack}`);
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
exports.default = CommandLoader;
