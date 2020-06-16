import path from 'path';
import fs from 'fs';

class TempPath {
  constructor(plugin, str) {
    this.plugin = plugin;
    this.str = str;
  }

  free() {
    this.plugin.free(this.str);
  }
}

export default class TempPlugin {
  tempPaths = {}

  constructor(henta) {
    this.henta = henta;
  }

  init(henta) {
    if (!fs.existsSync(`${henta.botdir}/temp/`)) {
      fs.mkdirSync(`${henta.botdir}/temp/`);
    }

    fs.readdir(`${henta.botdir}/temp/`, (err, paths) => paths.map(file => fs.unlinkSync(`${henta.botdir}/temp/${file}`)));
  }

  get(format) {
    for (let i = 0; i < 1e9; i++) {
      const filePath = path.resolve(`${this.henta.botdir}/temp/${i}.${format}`);
      if (this.tempPaths[filePath]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      this.tempPaths[filePath] = true;
      return new TempPath(this, filePath);
    }

    throw Error('Слишком много неудачных попыток получения свободного пути.');
  }

  free(filePath) {
    delete this.tempPaths[filePath];
  }
}
