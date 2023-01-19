// 便捷地回复客户端各种消息

export async function run(hazel, core, hold) {
  // 回复提示消息
  core.replyInfo = function (info, socket) {
    core.reply({ cmd: 'info', text: info }, socket);
  }

  // 回复警告消息
  core.replyWarn = function (warn, socket) {
    core.reply({ cmd: 'warn', text: warn }, socket);
  }

  // 回复“未知命令”消息
  core.replyUnknownCommand = function (socket) {
    core.reply({ cmd: 'warn', text: '未知命令，请查阅帮助文档。' }, socket);
  }
}

export const priority = 16;
