export default class OnlineStatusPlugin {
  init (henta) {
    // this.enableOnline(henta)
    setInterval(() => this.enableOnline(henta), 900e3)
  }

  async enableOnline (henta) {
    henta.log(`Включаю онлайн сообщества...`)
    try {
    await henta.vk.api.groups.enableOnline({ group_id: henta.groupId })
    } catch(e) {}
  }
}
