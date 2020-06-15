"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const emittery_1 = __importDefault(require("emittery"));
const commandLoader_1 = __importDefault(require("./commandLoader"));
const argumentParser_1 = __importDefault(require("./argumentParser"));
const attachmentParser_1 = __importDefault(require("./attachmentParser"));
class BotPlugin {
    constructor(henta) {
        this.commandLoader = new commandLoader_1.default(this);
        this.argumentParser = new argumentParser_1.default(this);
        this.attachmentParser = new attachmentParser_1.default(this);
        this.emitter = new emittery_1.default();
        this.on = this.emitter.on.bind(this.emitter);
        this.emit = this.emitter.emit.bind(this.emitter);
        this.henta = henta;
        this.addType = this.argumentParser.add.bind(this.argumentParser);
    }
    async init(henta) {
        const botPlugin = henta.getPlugin('common/bot');
        await this.commandLoader.loadCommands();
        this.argumentParser.init();
        botPlugin.setHandler('command', this.handler.bind(this));
    }
    get(commandName) {
        return this.commandLoader.aliases.get(commandName.toLowerCase());
    }
    checkPex(ctx, right, errStr) {
        if (!right) {
            return true;
        }
        if (!ctx.user.pex || !ctx.user.pex.is(`command:${right}`)) {
            ctx.answer(errStr || 'У вас недостаточно прав!');
            return false;
        }
        return true;
    }
    getCommandFromPayload(ctx) {
        const command = ctx.getPayloadValue('command');
        return Array.isArray(command) ? command.join(' ') : command;
    }
    async handler(ctx, next) {
        if (ctx.answered) {
            return next();
        }
        const commandLine = this.getCommandFromPayload(ctx) || ctx.text;
        if (!commandLine) {
            return next();
        }
        const args = commandLine.split(' ');
        const parentCommand = this.get(args[0]);
        if (!parentCommand) {
            return next();
        }
        const command = this.get(`${args[0]} ${args[1]}`) || parentCommand;
        // Setup context
        ctx.args = args;
        ctx.command = command;
        ctx.parentCommand = parentCommand;
        ctx.isSubcommand = command !== parentCommand;
        await this.emit('check', ctx);
        if (ctx.skipBotcmd) {
            return next();
        }
        if (command.right && !this.checkPex(ctx, command.slug, command.rightError)) {
            return next();
        }
        if (command.arguments) {
            const [error, res] = await this.argumentParser.parse(ctx, commandLine, command.arguments, ctx.isSubcommand ? 1 : 0, ctx.isSubcommand ? `${parentCommand.name} ${command.name}` : command.name);
            if (error) {
                ctx.answer(res);
                return next();
            }
            ctx.params = res;
        }
        if (command.attachments) {
            const [error, res] = await this.attachmentParser.parse(ctx, command.attachments, command.attachmentPromises);
            if (error) {
                ctx.answer(res);
                return next();
            }
            ctx.attachs = res;
        }
        await command.handler(ctx);
        return next();
    }
}
exports.default = BotPlugin;
