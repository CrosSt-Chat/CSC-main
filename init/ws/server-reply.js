// 便捷地回复客户端各种消息

export async function run(hazel, core, hold) {
  // 回复提示消息
  core.replyInfo = function (socket, info) {
    core.send({ cmd: 'info', text: info }, socket);
  }

  // 回复警告消息
  core.replyWarn = function (socket, warn) {
    core.send({ cmd: 'warn', text: warn }, socket);
  }
}

export const priority = 16;
