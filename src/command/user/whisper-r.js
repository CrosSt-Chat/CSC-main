// 私聊的 /r 快捷方式
export async function run(hazel, core, hold, socket, data) {
  // 这个命令不能直接被调用
  core.replyMalformedCommand(socket);
}

// 用户使用 /r nick text 命令发送私聊消息
export async function execByChat(hazel, core, hold, socket, line) {
  // 先把 /r 去掉
  line = line.slice(3).trim();

  // 如果没有参数，回复错误
  if (line.length == 0) {
    core.replyMalformedCommand(socket);
    return;
  }

  // 如果没有上一条私聊消息，回复错误
  if (typeof socket.lastWhisperFrom == 'undefined') {
    core.replyWarn('NO_LAST_WHISPER', '没有您之前的私聊记录，请使用 /w 进行私聊。', socket);
    return;
  }

  // 运行 whisper 命令
  await hazel.loadedFunctions.get('whisper').run(hazel, core, hold, socket, { nick: socket.lastWhisperFrom, text: line });
}

export const name = 'r';
export const requiredLevel = 1;
export const requiredData = [];
export const moduleType = 'ws-command';
