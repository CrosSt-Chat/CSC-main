// 锁定房间，禁止非成员进入
export async function run(hazel, core, hold, socket, data) {
  let targetChannel = socket.channel;
  // kick: 锁房后将所有非成员踢出房间
  // no-kick: 锁房后不踢出非成员
  let lockroomType = data.type;

  // 如果锁房类型不是 kick 或 no-kick，则报错
  if (lockroomType != 'kick' && lockroomType != 'no-kick') {
    core.replyMalformedCommand(socket);
    return;
  }

  // 检查房间是否已经被锁定
  if (hold.channel.get(targetChannel).isLocked) {
    core.replyWarn('CHANNEL_ALREADY_LOCKED', '房间已经被锁定', socket);
    return;
  }

  // 锁定房间
  hold.channel.get(targetChannel).isLocked = true;

  // 踢出全部非成员
  if (lockroomType == 'kick') {
    core.findSocket({ level: 1 }, hold.channel.get(targetChannel).socketList).forEach((targetSocket) => {
      core.replyWarn('CHANNEL_LOCKED', '该聊天室暂时不可用，请尝试加入其他聊天室。', targetSocket);
      targetSocket.close();
    });
  }

  // 向房间内所有成员广播锁定消息
  core.broadcastInfo(
    'CHANNEL_ARE_LOCKED', '已锁定本聊天室',
    core.findSocketByLevel(2, hold.channel.get(targetChannel).socketList)
  );

  // 写入存档
  core.archive('LOR', socket, lockroomType);
}

// 通过 /lockroom no-kick|kick 命令锁定房间
export async function execByChat(hazel, core, hold, socket, line) {
  // 获取锁房类型
  let lockroomType = line.slice(9).trim();
  if (lockroomType.length == 0) {
    lockroomType = 'kick';
  }

  // 执行锁房命令
  await run(hazel, core, hold, socket, { type: lockroomType });
}

export const name = 'lockroom';
export const requiredLevel = 4;
export const requiredData = ['type'];
export const moduleType = 'ws-command';
