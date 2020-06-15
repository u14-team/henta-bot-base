"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const minecraft_server_util_1 = __importDefault(require("minecraft-server-util"));
const rcon_client_1 = require("rcon-client");
class MinecraftProtocol {
    async getRaw(host, port) {
        try {
            const info = await minecraft_server_util_1.default(host, port);
            return [true, info];
        }
        catch (error) {
            return [false];
        }
    }
    clearCodes(str = '') {
        return str.replace(/§./g, '');
    }
    async run(host, rawPort) {
        const port = rawPort || 25565;
        const [isOnline, rawInfo] = await this.getRaw(host, port);
        return {
            title: 'Minecraft Java Edition',
            server: { host, port, online: isOnline },
            info: rawInfo && {
                name: this.clearCodes(rawInfo.descriptionText.split('\n')[0]),
                players: { online: rawInfo.onlinePlayers, max: rawInfo.maxPlayers },
                other: [
                    ['Ядро', `${this.clearCodes(rawInfo.version)} (${rawInfo.protocolVersion})`]
                ]
            }
        };
    }
    async openRcon(host, port, password) {
        try {
            const rcon = await rcon_client_1.Rcon.connect({ host, port, password });
            rcon['rawSend'] = rcon.send;
            rcon['send'] = async (command) => this.clearCodes(await rcon['rawSend'](command));
            rcon['close'] = () => rcon.end();
            return [false, rcon];
        }
        catch (error) {
            console.log(error.stack);
            return [true, 'offline'];
        }
    }
}
exports.default = MinecraftProtocol;
