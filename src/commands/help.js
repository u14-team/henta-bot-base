export default class HelpCommand {
  name = 'help';
  aliases = ['команды', 'хелп', 'start', 'commands', 'помощь', 'начать'];

  handler(ctx) {
    const botcmdPlugin = ctx.getPlugin('common/botcmd');
    ctx.builder()
      .line('📕 Мои команды:')
      .lines(botcmdPlugin.commandLoader.commands.map(v => `-- ${v.name}`))
      .answer();
  }
}
