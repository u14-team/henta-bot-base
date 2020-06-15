"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gamedig_1 = __importDefault(require("gamedig"));
class FiveMProtocol {
    async getRaw(host, port) {
        try {
            const info = await gamedig_1.default.query({ type: 'fivem', host, port });
            console.log(info);
            return [true, info];
        }
        catch (error) {
            console.log(error.stack);
            return [false];
        }
    }
    clearCodes(str) {
        return str.replace(/\^./g, '');
    }
    async run(host, rawPort) {
        const port = rawPort || 30120;
        const [isOnline, rawInfo] = await this.getRaw(host, port);
        return {
            title: 'Grand Theft Auto V - FiveM',
            server: { host, port, online: isOnline },
            info: rawInfo && {
                name: this.clearCodes(rawInfo.name),
                players: { online: rawInfo.raw.clients, max: rawInfo.maxplayers },
                other: [
                    ['Пинг', rawInfo.ping],
                    ['Карта', rawInfo.map],
                    ['Режим', `${rawInfo.raw.gamename} (${rawInfo.raw.gametype})`],
                    rawInfo.password && ['Есть пароль'],
                    ['Ядро', rawInfo.raw.info.server],
                ]
            }
        };
    }
}
exports.default = FiveMProtocol;
