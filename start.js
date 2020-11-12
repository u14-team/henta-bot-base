import { Henta } from 'henta';

const henta = new Henta();

function sendData(data) {
  if (!process.send) {
    return;
  }

  process.send(JSON.stringify(data));
}

function initHentadmin() {
  const hasHaPlugin = henta.pluginManager.getPluginInfo('common/hentadmin');
  if (!hasHaPlugin) {
    sendData({ type: 'nohentadmin' });
  }

  process.on('message', async message => {
    const body = JSON.parse(message.toString());

    try {
      sendData({
        type: 'messageResponse',
        random: body.random,
        data: await hasHaPlugin.instance.handler(body)
      });
    } catch (error) {
      sendData({
        type: 'messageResponse:error',
        random: body.random,
        data: {
          msg: error.msg,
          stack: error.stack
        }
      });
    }
  });
}

async function run() {
  await henta.init();
  initHentadmin();
  await henta.start();
  sendData({ type: 'enabled', data: { groupId: henta.groupId } });
}

run();
