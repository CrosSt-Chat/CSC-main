// 便捷地回复客户端各种消息

export async function run(hazel, core, hold) {
  // 回复提示消息
  core.replyInfo = function (code, text, socket, extraData) {
    if (typeof extraData == 'object') {
      core.reply({ cmd: 'info', code, text, extraData }, socket);
    } else {
      core.reply({ cmd: 'info', code, text }, socket);
    }
  }

  // 回复警告消息
  core.replyWarn = function (code, text, socket, extraData) {
    if (typeof extraData == 'object') {
      core.reply({ cmd: 'warn', code, text, extraData }, socket);
    } else {
      core.reply({ cmd: 'warn', code, text }, socket);
    }
  }

  // 回复“命令格式不正确”的警告消息
  core.replyMalformedCommand = function (socket) {
    core.reply({ cmd: 'warn', code: 'MALFORMED_COMMAND', text: '命令格式不正确，请查阅帮助文档。' }, socket);
  }
}

export const priority = 16;
