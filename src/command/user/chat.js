// 用于处理用户发送的聊天消息
export async function run(hazel, core, hold, socket, data) {
  // 频率限制器计数（好像没必要）
  // core.checkAddress(socket.remoteAddress, 0);

  // 如果是超长消息，进行频率限制
  if (data.length > 128) {
    core.checkAddress(socket.remoteAddress, 12);
  }

  // 如果消息以 / 开头，视为命令
  if (data.text[0] == '/') {
    // 查找命令是否存在且支持使用聊天框运行
    let command = hazel.loadedFunctions.get(data.text.slice(1, data.text.indexOf(' ')));

    // 如果命令不存在、不公开、权限不足，视为返回命令格式错误
    if (typeof command == 'undefined') {
      core.replyUnknownCommand(socket);
      return;
    }

    if ((!command.moduleType === 'ws-command') || typeof command.execByChat != 'function') {
      core.replyUnknownCommand(socket);
      return;
    }

    if (command.requiredLevel > socket.level) {
      core.replyUnknownCommand(socket);
      return;
    }

    // 运行命令
    try {
      await command.execByChat(hazel, core, hold, socket, data.text);
    } catch (error) {
      hazel.emit('error', error, socket);
    }

    return;
  }

  // 去除首尾空格
  data.text = data.text.trim();

  // 如果是空消息，不处理
  if (data.text.length == 0) { return; }

  // 将连续的三个以上的换行符替换为两个换行符
  // Markdown 引擎会把三个以上的换行符处理掉，这里就不用处理了
  // data.text = data.text.replace(/\n{3,}/g, '\n\n');
  // data.text = data.text.replace(/\r\n{3,}/g, '\r\n\r\n');

  // 在聊天室广播消息
  if (typeof socket.trip == 'string') {
    core.broadcast({
      cmd: 'chat',
      type: 'chat',
      nick: socket.nick,
      trip: socket.trip,
      utype: socket.permission,
      member: (socket.level >= core.config.level.member),
      admin: (socket.level >= core.config.level.admin),
      text: data.text
    }, hold.channel[socket.channel].socketList);
  } else {
    core.broadcast({
      cmd: 'chat',
      type: 'chat',
      nick: socket.nick,
      utype: socket.permission,
      text: data.text
    }, hold.channel[socket.channel].socketList);
  }

  // 记录 stats
  core.increaseState('messages-sent');

  // 写入存档
  core.archive('MSG', socket, data.text);
}

export const name = 'chat';
export const requiredLevel = 1;
export const requiredData = ['text'];
export const moduleType = 'ws-command';