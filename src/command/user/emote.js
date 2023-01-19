// 用于处理用户发送的 @nick xxx 消息
export async function run(hazel, core, hold, socket, data) {
  // 频率限制器计数（好像没必要）
  // core.checkAddress(socket.remoteAddress, 0);

  // 如果是超长消息，进行频率限制
  if (data.length > 128) {
    core.checkAddress(socket.remoteAddress, 12);
  }

  // 去除首尾空格
  data.text = data.text.trim();

  // 如果是空消息，不处理
  if (data.text.length == 0) { return; }

  // 在聊天室广播消息
  if (typeof socket.trip == 'string') {
    core.broadcast({
      cmd: 'info',
      code: 'EMOTE',
      nick: socket.nick,
      trip: socket.trip,
      text: '@' + socket.nick + ' ' + data.text
    }, hold.channel[socket.channel].socketList);
  } else {
    core.broadcast({
      cmd: 'info',
      code: 'EMOTE',
      nick: socket.nick,
      text: '@' + socket.nick + ' ' + data.text
    }, hold.channel[socket.channel].socketList);
  }

  // 记录 stats
  core.increaseState('messages-sent');

  // 写入存档
  core.archive('EMO', socket, data.text);
}

// 用户使用 /me 命令运行的模块
export async function execByChat(hazel, core, hold, socket, line) {
  // 从用户的输入中提取出消息内容
  line = line.slice(4).trim();

  // 如果是超长消息，进行频率限制
  if (line.length > 128) {
    core.checkAddress(socket.remoteAddress, 12);
  }

  // 如果是空消息，返回命令格式错误
  if (line.length == 0) {
    core.replyUnknownCommand(socket);
    return;
  }

  // 在聊天室广播消息
  if (typeof socket.trip == 'string') {
    core.broadcast({
      cmd: 'info',
      code: 'EMOTE',
      nick: socket.nick,
      trip: socket.trip,
      text: '@' + socket.nick + ' ' + line
    }, hold.channel[socket.channel].socketList);
  } else {
    core.broadcast({
      cmd: 'info',
      code: 'EMOTE',
      nick: socket.nick,
      text: '@' + socket.nick + ' ' + line
    }, hold.channel[socket.channel].socketList);
  }

  // 记录 stats
  core.increaseState('messages-sent');

  // 写入存档
  core.archive('EMO', socket, line);
}

export const name = 'me';
export const requiredLevel = 1;
export const requiredData = ['text'];
export const moduleType = 'ws-command';
