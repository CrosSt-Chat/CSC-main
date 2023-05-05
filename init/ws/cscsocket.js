// 修改 ws 包中原有的 WebSocket 对象以更好的支持十字街
import { WebSocket } from 'ws';

class CSCWebSocket extends WebSocket {
  constructor(...args) {
    super(...args);

    // 生成一个随机的 connectionID
    this.connectionID = Math.random().toString(36).slice(2, 10);
  }

  // 十字街在运行时使用的属性
  connectionID;
  remoteAddress;
  isAllowedIP = false;
  isDeniedIP = false;

  nick;
  trip;
  permission = 'GUEST';
  level = 0;
  channel;
  isInvisible = false;
  lastWhisperFrom;
}

export async function run(hazel, core, hold) {
  // 在服务器初始化完毕后，替换 ws 包中的 WebSocket 对象
  hazel.on('initialized', () => {
    hold.wsServer.options.WebSocket = CSCWebSocket;
  });

  // 服务器代码重载后，替换 ws 包中的 WebSocket 对象
  hazel.on('reloaded-complete', () => {
    hold.wsServer.options.WebSocket = CSCWebSocket;
  });
}

export const priority = 8;
