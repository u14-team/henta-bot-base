"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function loadDefaultTypes(parser) {
    // Integer
    parser.add('integer', data => {
        const value = parseInt(data.word, 10);
        if (Number.isNaN(value)) {
            return [true, '⛔ Вы указали не число'];
        }
        if (data.argument.min && value < data.argument.min) {
            return [true, `⛔ Ваше число не должно быть меньше ${data.argument.min}`];
        }
        if (data.argument.max && value > data.argument.max) {
            return [true, `⛔ Ваше число не должно быть больше ${data.argument.max}`];
        }
        return [false, value];
    });
    // String
    parser.add('string', data => {
        const words = data.commandLine.split(' ');
        words.splice(0, data.index + data.offset + 1);
        const str = words.join(' ');
        if (data.argument.max && str.length > data.argument.max) {
            return [true, 'botcmd:stringMax'];
        }
        if (data.argument.min && str.length < data.argument.min) {
            return [true, 'botcmd:stringMin'];
        }
        return [false, str];
    });
    parser.add('word', data => {
        const str = data.word;
        if (data.argument.max && str.length > data.argument.max) {
            return [true, 'botcmd:stringMax'];
        }
        if (data.argument.min && str.length < data.argument.min) {
            return [true, 'botcmd:stringMin'];
        }
        return [false, str];
    });
}
exports.default = loadDefaultTypes;
