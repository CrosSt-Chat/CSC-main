// 运行 WebSocket 客户端发来的命令
// 出于规范性考虑，该函数应该属于 function 而不是 init
// 但是为了少调用几次 runFunction 函数，我们将其归类在 init 中

export async function run(hazel, core, hold) {
  core.execCommand = async function (socket, payload) {
    // 直接从 hazel 中拿命令
    let command = hazel.loadedFunctions.get(payload.cmd);

    // 如果命令不存在，或者不公开，提示命令不存在
    if (typeof command == 'undefined') {
      core.replyUnknownCommand(socket);
      return;
    }

    if (!command.moduleType === 'ws-command') {
      core.replyUnknownCommand(socket);
      return;
    }

    // 检查命令的参数是否齐全
    if (command.requiredData.length > 0) {
      for (let attr of command.requiredData) {
        if (typeof payload[attr] == 'undefined') {
          core.replyUnknownCommand(socket);
          return;
        }
      }
    }

    // 运行命令
    try {
      await command.run(hazel, core, hold, socket, payload);
    } catch (error) {
      hazel.emit('error', error, socket);
    }
  }
}

export const priority = 32;
