"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gamedig_1 = __importDefault(require("gamedig"));
const dgram_1 = __importDefault(require("dgram"));
const dns_1 = require("dns");
class SampRconConnection {
    async connect(options) {
        this.options = options;
        this.socket = dgram_1.default.createSocket('udp4');
        this.options.address = this.options.host.match(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)
            ? this.options.host
            : await dns_1.promises.resolve4(options.host);
        const binAddr = this.options.address.split('.').map(v => String.fromCharCode(+v)).join('');
        this.prefix = `SAMP${binAddr}${this.bin(options.port)}x${this.bin(options.password.length)}${options.password}`;
        this.responsePrefix = `SAMP${binAddr}${this.bin(options.port)}x`;
        const testResult = await this.send('echo 1337');
        if (testResult !== '1337') {
            this.socket.close();
            throw Error(`Extends '1337' got '${testResult}'`);
        }
    }
    bin(n) {
        return String.fromCharCode(n & 0xFF, n >>> 8);
    }
    send(command) {
        const buffer = Buffer.from(`${this.prefix}${this.bin(command.length)}${command}`, 'binary');
        return new Promise((resolve, reject) => {
            this.socket.send(buffer, 0, buffer.length, this.options.port, this.options.host, (error) => {
                const timeout = setTimeout(() => resolve(''), 100);
                this.socket.once('message', (msg) => {
                    clearTimeout(timeout);
                    resolve(msg.toString('binary', 13));
                });
                if (error) {
                    this.socket.close();
                    reject(error);
                }
            });
        });
    }
    close() {
        this.socket.close();
        this.socket = null;
    }
}
exports.SampRconConnection = SampRconConnection;
class SampProtocol {
    constructor() {
        /* (async () => {
        const [isError, rcon] = await this.openRcon('176.96.238.228', 7777, 'fdjbn89099jklm908900gh');
        rcon['send']('version').then(msg => console.log(msg));
        })();*/
    }
    async getRaw(host, port) {
        try {
            const info = await gamedig_1.default.query({ type: 'samp', host, port });
            console.log(info);
            return [true, info];
        }
        catch (error) {
            console.log(error.stack);
            return [false];
        }
    }
    getWeather(id) {
        const ids = [
            'Чистое небо',
            'Чистое небо',
            'Чистое небо',
            'Чистое небо',
            'Чистое небо',
            'Чистое небо',
            'Чистое небо',
            'Чистое небо',
            'Гроза',
            'Густой туман и пасмурно',
            'Ясное небо',
            'Дикое пекло',
            'Смуглая и неприятная',
            'Смуглая и неприятная',
            'Смуглая и неприятная',
            'Смуглая и неприятная',
            'Тусклая и дождливая',
            'Жара',
            'Жара',
            'Песчаная буря',
            'Туманная погода',
            'Ночь с пурпурным небом',
            'Ночь с зеленоватым небом',
            'Бледно-оранжевая',
            'Бледно-оранжевая',
            'Бледно-оранжевая',
            'Бледно-оранжевая',
            'Свеже-синяя',
            'Свеже-синяя',
            'Свеже-синяя',
            'Неясная',
            'Неясная',
            'Неясная',
            'Вечер в коричневых оттенках',
            'Синиме/пурпурные оттенки',
            'Тусклая и унылая в коричневых тонах',
            'Яркая и туманная, оранжевая',
            'Очень яркая',
            'Неясная в пурпурных/синих цветах',
            'Тёмные и едкие облака',
            'Чёрно-белое небо',
            'Пурпурное небо'
        ];
        return ids[id];
    }
    async run(host, rawPort) {
        const port = rawPort || 7777;
        const [isOnline, rawInfo] = await this.getRaw(host, port);
        return {
            title: 'Samp',
            server: { host, port, online: isOnline },
            info: rawInfo && {
                name: rawInfo.name,
                players: { online: rawInfo.raw.numplayers, max: rawInfo.maxplayers },
                other: [
                    rawInfo.password && ['Есть пароль'],
                    ['Карта', rawInfo.raw.map],
                    ['Режим', rawInfo.raw.gamemode],
                    ['Версия', rawInfo.raw.rules.version],
                    ['Время', rawInfo.raw.rules.worldtime],
                    ['Погода', `${this.getWeather(rawInfo.raw.rules.weather)} (${rawInfo.raw.rules.weather})`],
                    ['Пинг', rawInfo.ping]
                    // ['Система', rawInfo.listentype === 'l' ? 'Linux' : 'Windows']
                ]
            }
        };
    }
    async openRcon(host, port, password) {
        try {
            const rcon = new SampRconConnection();
            await rcon.connect({ host, port, password });
            return [false, rcon];
        }
        catch (error) {
            console.log(error.stack);
            return [true, 'offline'];
        }
    }
}
exports.default = SampProtocol;
