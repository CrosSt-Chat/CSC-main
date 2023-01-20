// 解封某个 IP 地址
export async function run(hazel, core, hold, socket, data) {
  // 如果该 IP 地址不在封禁列表中
  if (!hold.bannedIPlist.includes(data.address)) {
    core.replyMalformedCommand(socket);
    return;
  }

  // 解封该 IP 地址
  core.removeFromArray(hold.bannedIPlist, data.address);

  // 通知全部管理员
  core.broadcastInfo(
    'UNBAN_IP',
    socket.nick + ' 解封了 IP 地址 `' + data.address + '`。',
    core.findSocketByLevel(4),
    { from: socket.nick, address: data.address }
  );

  // 写入存档
  core.archive('UNB', socket, data.address);
}

// 通过 /unban <address> 命令解封某个 IP 地址
export async function execByChat(hazel, core, hold, socket, line) {
  let address = line.slice(6).trim();

  // 运行命令
  await run(hazel, core, hold, socket, { address });
}

export const name = 'unban';
export const requiredLevel = 4;
export const requiredData = ['address'];
export const moduleType = 'ws-command';
