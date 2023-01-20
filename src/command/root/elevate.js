// 提权至 root 权限
export async function run(hazel, core, hold, socket, data) {
  // 验证输入的 root 密码
  if (data.passcode !== core.config.rootPasscode) {
    // 进行严格的频率限制
    core.checkAddress(socket.remoteAddress, 12000000);
    return;
  }

  // 提权
  socket.trip = '/ROOT/';
  socket.permission = 'ROOT';
  socket.level = core.config.level.root;

  // 向该用户发送成功消息
  core.replyInfo('PERMISSION_UPDATE', '您的权限已更新。', socket);

  // 写入存档
  core.archive('ERT', socket, '');
}

// 用户使用 /elevate passcode 提权
export async function execByChat(hazel, core, hold, socket, line) {
  await run(hazel, core, hold, socket, { passcode: line.slice(8).trim() });
}

export const name = 'elevate';
export const requiredLevel = 1;
export const requiredData = ['passcode'];
export const moduleType = 'ws-command';
