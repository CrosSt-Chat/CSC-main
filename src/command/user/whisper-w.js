// 私聊的 /w 快捷方式
export async function run(hazel, core, hold, socket, data) {
  // 这个命令不能直接被调用
  core.replyMalformedCommand(socket);
}

// 用户使用 /w nick text 命令发送私聊消息
export async function execByChat(hazel, core, hold, socket, line) {
  // 先把 /w 去掉
  line = line.slice(3).trim();

  // 如果没有参数，回复错误
  if (line.length == 0) {
    core.replyMalformedCommand(socket);
    return;
  }

  // 获取昵称
  let nick = line.split(' ')[0];
  let text = line.slice(nick.length).trim();

  // 验证输入的昵称
  if (!core.verifyNickname(nick)) {
    core.replyMalformedCommand(socket);
    return;
  }

  // 运行 whisper 命令
  await hazel.loadedFunctions.get('whisper').run(hazel, core, hold, socket, { nick, text });
}

export const name = 'w';
export const requiredLevel = 1;
export const requiredData = [];
export const moduleType = 'ws-command';
