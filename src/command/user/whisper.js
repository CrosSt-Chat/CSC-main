// 在聊天室内发送私聊消息
export async function run(hazel, core, hold, socket, data) {
  // 频率限制器计数
  core.checkAddress(socket.remoteAddress, 3);

  // 检查用户是否可以发送消息
  if (!core.canSpeak(socket)) {
    return;
  }

  // 如果是超长消息，进行频率限制
  if (data.text.length > 32) {
    core.checkAddress(socket.remoteAddress, 12);
  }

  // 去除首尾空格
  data.text = data.text.trim();
  
  // 如果是空消息
  if (data.text.length == 0) {
    core.replyMalformedCommand(socket);
    return;
  }

  // 检查昵称
  if (!core.verifyNickname(data.nick)) {
    core.replyWarn('NICKNAME_INVALID', '昵称应当仅由汉字、字母、数字和不超过 3 个的特殊字符（_-+.:;）组成，而且不能太长。', socket);
    return;
  }

  // 查找目标用户
  let [targetSocket] = core.findSocket({ channel: socket.channel, nick: data.nick });

  // 如果目标用户不存在
  if (!targetSocket) {
    core.replyWarn('USER_NOT_FOUND', '在这个聊天室找不到您指定的用户。', socket);
    return;
  }

  // 如果目标用户是自己
  if (targetSocket == socket) {
    core.replyWarn('WHISPER_SELF', '您不能给自己发私聊消息。', socket);
    return;
  }

  // 发送私聊消息
  core.reply({
    cmd: 'chat',
    type: 'whisper',
    from: socket.nick,
    level: socket.level,
    utype: socket.permission,
    nick: '【收到私聊】 ' + socket.nick,
    trip: socket.trip || ' ',
    text: data.text
  }, targetSocket);

  // 保存到“上一次私聊”中
  targetSocket.lastWhisperFrom = socket.nick;

  // 回复发送成功
  core.reply({
    cmd: 'chat',
    type: 'whisper',
    nick: '【发送私聊】 ' + targetSocket.nick,
    trip: targetSocket.trip || ' ',
    text: data.text
  }, socket);

  // 保存到“上一次私聊”中
  socket.lastWhisperFrom = targetSocket.nick;

  // 写入存档
  core.archive('WHI', socket, '-> ' + targetSocket.nick + ' ' + data.text);
}

export const name = 'whisper';
export const requiredLevel = 1;
export const requiredData = ['nick', 'text'];
export const moduleType = 'ws-command';
