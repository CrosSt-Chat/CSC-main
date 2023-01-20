// 解锁房间
export async function run(hazel, core, hold, socket, data) {
  // 检查房间是否已经被锁定
  if (!hold.channel.get(socket.channel).isLocked) {
    core.replyWarn('CHANNEL_ALREADY_UNLOCKED', '房间未锁定', socket);
    return;
  }

  // 解锁房间
  hold.channel.get(socket.channel).isLocked = false;

  // 向房间内所有成员广播锁定消息
  core.broadcastInfo('CHANNEL_ARE_UNLOCKED', '已解锁本聊天室', core.findSocketByLevel(2, hold.channel.get(socket.channel).socketList));

  // 写入存档
  core.archive('ULR', socket, '');
}

// 通过 /unlockroom  命令解锁房间
export async function execByChat(hazel, core, hold, socket, line) {
  await run(hazel, core, hold, socket);
}

export const name = 'unlockroom';
export const requiredLevel = 4;
export const requiredData = [];
export const moduleType = 'ws-command';
