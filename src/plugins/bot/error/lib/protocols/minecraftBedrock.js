"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const libquery_1 = __importDefault(require("libquery"));
const librcon_1 = __importDefault(require("librcon"));
class MinecraftBedrockProtocol {
    async getRaw(host, port) {
        try {
            const info = await libquery_1.default.query(host, port);
            console.log(info);
            return [true, info];
        }
        catch (error) {
            return [false];
        }
    }
    clearCodes(str) {
        return str.replace(/§./g, '');
    }
    async run(host, rawPort) {
        const port = rawPort || 19132;
        const [isOnline, rawInfo] = await this.getRaw(host, port);
        return {
            title: 'Minecraft Bedrock Edition',
            server: { host, port, online: isOnline },
            info: rawInfo && {
                name: this.clearCodes(rawInfo.motd.split('\n')[0]),
                players: { online: rawInfo.online, max: rawInfo.max },
                other: [
                    ['Ядро', `${this.clearCodes(rawInfo.software)} (${rawInfo.version})`],
                    ['Карта', `${this.clearCodes(rawInfo.map)}`],
                    ['Плагины', this.clearCodes(rawInfo.plugins)],
                ]
            }
        };
    }
    async openRcon(host, port, password) {
        try {
            const rcon = {
                send: async (command) => this.clearCodes(await librcon_1.default.send(command, password, host, port)),
                close: () => { },
                socket: true
            };
            return [false, rcon];
        }
        catch (error) {
            console.log(error.stack);
            return [true, 'offline'];
        }
    }
}
exports.default = MinecraftBedrockProtocol;
