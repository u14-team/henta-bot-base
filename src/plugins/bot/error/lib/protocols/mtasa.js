"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gamedig_1 = __importDefault(require("gamedig"));
const dgram_1 = __importDefault(require("dgram"));
class MtaSaProtocol {
    async getRaw(host, port) {
        try {
            const info = await gamedig_1.default.query({ type: 'mtasa', host, port });
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
        const port = rawPort || 22003;
        const [isOnline, rawInfo] = await this.getRaw(host, port);
        return {
            title: 'Multi theft auto',
            server: { host, port, online: isOnline },
            info: rawInfo && {
                name: this.clearCodes(rawInfo.name),
                players: { online: rawInfo.raw.numplayers, max: rawInfo.maxplayers },
                other: [
                    rawInfo.password && ['Есть пароль'],
                    ['Пинг', rawInfo.ping],
                    ['Карта', rawInfo.map],
                    ['Игровой режим', rawInfo.raw.gametype],
                    ['Версия', rawInfo.raw.version]
                ]
            }
        };
    }
    sendRconCommand(command, password, host, port) {
        return new Promise((resolve, reject) => {
            const connection = dgram_1.default.createSocket('udp4');
            const buffer = Buffer.alloc(11 + password.length + command.length); // 4 + 5 + 1 + 1
            // fill the buffer
            buffer.writeUInt32LE(0xFFFFFFFF, 0); // magic code
            buffer.write('rcon ', 4);
            buffer.write(password, 9, password.length);
            buffer.write(' ', 9 + password.length, 1);
            buffer.write(command, 10 + password.length, command.length);
            buffer.write('\n', 10 + password.length + command.length, 1);
            connection.send(buffer, 0, buffer.length, port, host, (error) => {
                connection.once('message', (msg) => {
                    connection.close();
                    resolve(msg.toString());
                });
                if (error) {
                    connection.close();
                    reject(error);
                }
            });
        });
    }
    async openRcon_(host, port, password) {
        try {
            const rcon = {
                send: async (command) => this.clearCodes(await this.sendRconCommand(command, password, host, port)),
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
exports.default = MtaSaProtocol;
