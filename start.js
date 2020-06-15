/* Это стартер для HentAdmin */
require = require("esm")(module);

const { default: Henta } = require('henta');
const henta = new Henta();

function sendData(data) {
  process.send(JSON.stringify(data));
}

function initHentadmin() {
  const hasHaPlugin = henta.pluginManager.getPluginInfo('common/hentadmin');
  if (!hasHaPlugin) {
    sendData({ type: "nohentadmin" });
  }

  process.on('message', message => {
    hasHaPlugin.handler(message);
  });
}

async function run() {
  await henta.init();
  initHentadmin();
  await henta.start();
  sendData({ type: "enabled", groupId: henta.groupId });
}

run();
