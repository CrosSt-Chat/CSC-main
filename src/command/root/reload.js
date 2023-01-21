// 重载十字街几乎全部的代码
export async function run(hazel, core, hold, socket, data) {
  core.replyInfo('ROOT', '重载请求已接收。', socket);

  // 重载十字街
  await hazel.reloadModules(false);

  // 记录重载时间
  hold.lastReloadTime = Date.now();
}

// 使用 /reload 重载十字街
export async function execByChat(hazel, core, hold, socket, line) {
  if (line.trim() == '/reload') {
    await run(hazel, core, hold, socket);
  } else {
    core.replyMalformedCommand(socket);
    return;
  }
}

export const name = 'reload';
export const requiredLevel = 10;
export const requiredData = [];
export const moduleType = 'ws-command';
