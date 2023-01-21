// 向聊天室内的某个用户发出邀请到某个聊天室
export async function run(hazel, core, hold, socket, data) {
  // 频率计数器计数
  core.checkAddress(socket.remoteAddress, 5);

  // 检查用户是否可以发送消息
  if (!core.canSpeak(socket)) {
    return;
  }

  // 检查用户输入的数据
  if (!core.verifyNickname(data.nick)) {
    // 这是客户端生成的数据，不是用户输入的数据
    // 就不用告诉用户错在哪了
    core.replyMalformedCommand(socket);
    return;
  }

  // 不能对自己发出邀请
  if (data.nick == socket.nick) {
    core.replyWarn('INVITE_SELF', '您不能对自己发出邀请。', socket);
    return;
  }

  // 如果没带 data.channel 就生成一个随机聊天室名
  if (typeof data.channel != 'string') {
    data.channel = 'Pri_' + Math.random().toString(36).slice(2, 10);
  }

  // 检查聊天室名是否合法
  if (!core.verifyChannel(data.channel)) {
    core.replyWarn('CHANNEL_NAME_INVALID', '聊天室名称应当仅由汉字、字母和数字组成，并不超过 20 个字符。', socket);
    return;
  }

  // 查找目标用户
  let [targetSocket] = core.findSocket({ channel: socket.channel, nick: data.nick });

  // 如果目标用户不存在
  if (!targetSocket) {
    core.replyWarn('USER_NOT_FOUND', '在这个聊天室找不到您指定的用户。', socket);
    return;
  }

  // 发送邀请
  core.replyInfo('INVITE', socket.nick + ' 邀请您加入 ?' + data.channel + ' 聊天室。', targetSocket, { nick: data.nick, channel: data.channel });
  core.replyInfo('INVITE_SENT', '您邀请了 ' + data.nick + ' 加入 ?' + data.channel + ' 聊天室。', socket, { channel: data.channel });

  // 记录 stats
  core.increaseState('invites-sent');

  // 写入存档
  core.archive('INV', socket, data.nick + ' ' + data.channel);
}

export const name = 'invite';
export const requiredLevel = 1;
export const requiredData = ['nick'];
export const moduleType = 'ws-command';
