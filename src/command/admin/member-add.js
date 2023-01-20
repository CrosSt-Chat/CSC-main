// 管理员添加成员
export async function run(hazel, core, hold, socket, data) {
  // 验证输入的 trip
  if (!core.verifyTrip(data.trip)) {
    core.replyWarn('INVALID_TRIP', '请检查您输入的识别码。', socket);
    return;
  }

  // 检查识别码是否已经是成员
  if (core.config.memberList.includes(data.trip)) {
    core.replyWarn('INVALID_TRIP', '请检查您输入的识别码。', socket);
    return;
  }

  // 检查识别码是否已经是管理员
  if (core.config.adminList.includes(data.trip)) {
    core.replyWarn('PERMISSION_DENIED', '越权操作。', socket);
    return;
  }

  // 添加成员
  core.config.memberList.push(data.trip);

  // 保存配置
  core.saveConfig();

  // 查找成员的 socket，如果存在则更新权限
  let matchSockets = core.findSocketTiny('trip', data.trip);
  if (matchSockets.length > 0) {
    matchSockets.forEach((matchSocket) => {
      matchSocket.permission = 'MEMBER';
      matchSocket.level = core.config.level.member;

      // 向成员发送消息
      core.replyInfo('PERMISSION_UPDATE', '您的权限已更新。', matchSocket);
    });
  }

  // 向全部成员广播消息
  core.broadcast({
    cmd: 'info',
    code: 'MEMBER_ADD',
    text: '已添加新成员：' + data.trip,
    data: { trip: data.trip },
  }, core.findSocketByLevel(core.config.level.member));

  // 写入存档
  core.archive('ADM', socket, data.trip);
}

// 用户使用 /addmem xxxxxx 添加的成员
export async function execByChat(hazel, core, hold, socket, line) {
  let trip = line.slice(7).trim();

  // 验证输入的 trip
  if (!core.verifyTrip(trip)) {
    core.replyMalformedCommand(socket);
    return;
  }

  // 运行命令
  await run(hazel, core, hold, socket, { trip });
}

export const name = 'addmem';
export const requiredLevel = 4;
export const requiredData = ['trip'];
export const moduleType = 'ws-command';
