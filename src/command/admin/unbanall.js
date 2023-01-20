// 解封全部 IP 地址
export async function run(hazel, core, hold, socket, data) {
  // 清空封禁列表
  hold.bannedIPlist = [];

  // 通知全部管理员
  core.broadcastInfo(
    'UNBAN_ALL',
    socket.nick + ' 解封了全部 IP 地址。',
    core.findSocketByLevel(4),
    { from: socket.nick }
  );

  // 写入存档
  core.archive('UBA', socket, '');
}

// 通过 /unbanall 命令解封全部 IP 地址
export async function execByChat(hazel, core, hold, socket, line) {
  await run(hazel, core, hold, socket);
}

export const name = 'unbanall';
export const requiredLevel = 4;
export const requiredData = [];
export const moduleType = 'ws-command';
