// 管理员封禁某个 IP
export async function run(hazel, core, hold, socket, data) {
  let IPV4_REGEXP = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // 检查 IP 是否已经被封禁
  if (hold.bannedIPlist.includes(data.ip)) {
    core.replyMalformedCommand(socket);
    return;
  }

  // 检查 IP 是否合法
  if (!IPV4_REGEXP.test(data.ip)) {
    core.replyWarn('IP_INVALID', '您输入的 IP 不符合格式。', socket);
    return;
  }

  // 封禁该的 IP
  hold.bannedIPlist.push(data.ip);

  // 强制退出该用户
  core.findSocketTiny('remoteAddress', data.ip).forEach((targetSocket) => {
    targetSocket.terminate();
  });

  // 通知全部管理员
  core.broadcastInfo(
    'BAN_IP',
    socket.nick + ' 封禁了 IP 地址 `' + data.ip + '`。',
    core.findSocketByLevel(4),
    { from: socket.nick, ip: data.ip}
  );

  // 写入存档
  core.archive('BIP', socket, data.ip);
}

// 通过 /ban <ip> 命令封禁某人
export async function execByChat(hazel, core, hold, socket, line) {
  await run(hazel, core, hold, socket, { ip: line.slice(6).trim() });
}

export const name = 'banip';
export const requiredLevel = 4;
export const requiredData = ['ip'];
export const moduleType = 'ws-command';
