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
      utype: socket.uType,
      member: (socket.level >= core.config.level.member),
      admin: (socket.level >= core.config.level.admin),
      text: data.text
    }, hold.channel[socket.channel].socketList);
  } else {
    core.broadcast({
      cmd: 'chat',
      type: 'chat',
      nick: socket.nick,
      utype: socket.uType,
      text: data.text
    }, hold.channel[socket.channel].socketList);
  }
}

export const name = 'chat';
export const requiredLevel = 1;
export const requiredData = ['text'];
export const moduleType = 'ws-command';
