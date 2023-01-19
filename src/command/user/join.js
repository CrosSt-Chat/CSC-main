// 用于处理用户加入房间的请求
import { createHash } from 'crypto';

export async function run(hazel, core, hold, socket, data) {
  // 频率限制器计数
  core.checkAddress(socket.remoteAddress, 8);

  // 如果用户已经加入了聊天室，则不处理
  if (typeof socket.channel != 'undefined') { return; }

  // 如果用户提供了 key，则必须提供 trip，反之亦然
  if ((typeof data.trip == 'string') ^ (typeof data.key == 'string')) { return; }

  // 检查聊天室名称是否合法
  if (!core.verifyChannel(data.channel)) {
    server.reply({cmd: 'warn', text: '聊天室名称应当仅由汉字、字母和数字组成，并不超过 20 个字符。'}, socket);
    return;
  }

  // 用户信息模板
  const userInfo = {
    nick: '',
    uType: 'USER',
    trip: null,
    level: core.config.level.user,
    invisible: false
  };

  // 如果用户提供了 key 和 trip，则使用 key 验证已有的用户信息
  if (typeof data.trip == 'string') {
    // 验证 nick、key 和 trip
    if (!(() => {
      // 以下是一个 if 语句里的 IIFE
      // 先检查昵称和 trip 是否合规
      if (!core.verifyNickname(data.nick)) { return false; }
      if (!core.verifyTrip(data.trip)) { return false; }

      // 检查 key 是否合规
      if (!/^[a-zA-Z0-9+/]{32}$/.test(data.key)) { return false; }

      // 检查 key
      const hash = createHash('sha256');
      hash.update(data.trip + core.config.salts.auth, 'base64');
      return hash.digest('base64').slice(0, 32) == data.key;
    })()) {
      // 如果验证失败，则返回错误信息
      server.reply({
        cmd: 'infoInvalid',
      },socket);
      socket.close();
      return;
    }

    // 没问题的话，保存用户信息
    userInfo.nick = data.nick;
    userInfo.trip = data.trip;
  } else {
    // 如果用户提供了密码，则使用密码生成 trip
    // 先检查昵称
    if (!core.verifyNickname(data.nick)) {
      server.reply({cmd: 'warn', text: '昵称应当仅由汉字、字母、数字和不超过 3 个的特殊字符（_-+.:;）组成，而且不能太长。'}, socket);
      return;
    }

    // 使用昵称生成用户信息
    userInfo.nick = data.nick;

    // 如果用户提供了密码，则使用密码生成 trip
    if (typeof data.password == 'string') {
      const hash = createHash('sha256');
      hash.update(data.password + core.config.salts.trip);
      userInfo.trip = hash.digest('base64').slice(0, 6);
    }
  }

  // 判断用户是否为成员 / 管理员
  if (typeof data.password == 'string') {
    if ( core.config.adminList.includes(userInfo.trip)) {
      userInfo.uType = 'ADMIN';
      userInfo.level = core.config.level.admin;
    } else if (core.config.memberList.includes(userInfo.trip)) {
      userInfo.uType = 'MEMBER';
      userInfo.level = core.config.level.member;
    }
  }

  // 验证客户端名称的相关内容
  let cName = 'null';
  if (typeof data.clientName == 'string') {
    // 最常用的十字街网页版直接通过，加快速度
    if (data.clientName == '[十字街网页版](https://crosst.chat/)') {
      cName = data.clientName;
    } else {
      if ((() => {
        // 如果客户端名称中存在换行，直接返回 false
        if (data.clientName.indexOf('\r') != -1 || data.clientName.indexOf('\n') != -1) { return false; }
        // 如果客户端名称中含有暗示为官方客户端的关键字，则需要验证 key
        let forbiddenName = ['十字街', '官方', '版'];
        for (let item of forbiddenName) {
          if (data.clientName.indexOf(item) != -1) {
            // 如果 key 不合规，返回 false
            if (!/^[a-zA-Z0-9+/]{32}$/.test(data.clientKey)) { return false; }
            // 验证 key
            const hash = createHash('sha256');
            hash.update(data.clientName + core.config.salts.client);
            return hash.digest('base64').slice(0, 32) == data.clientKey;
          }
        }
        // 如果客户端名称中没有暗示为官方客户端的关键字，则不需要验证 key
        return true;
      })()) {
        cName = data.clientName;
      }
    }
  }

  // 检查聊天室对象是否存在，如果不存在则创建
  if (typeof hold.channel[data.channel] == 'undefined') {
    hold.channel[data.channel] = {
      isLocked: false,
      lastActive: Date.now(),
      socketList: new Set(),  
    };
  }

  // 检查聊天室是否被锁定
  if (hold.channel[data.channel].isLocked || hold.lockAllChannels) {
    // 如果用户是成员，则允许进入
    if (userInfo.level < core.config.level.member) {
      core.replyWarn('## 非常抱歉，该聊天室已锁定，即暂时禁止非成员进入。\n**可能的原因：**\n\\* 为提供更好的服务体验，十字街的 ?公共聊天室 一般会在深夜（北京时间）锁定。\n\\* 这个聊天室出现了大量且难以控制的违规行为，暂时锁定以维持秩序。\n**您可以尝试：**\n\\* 如果您是成员，请使用您的密码重新加入这个聊天室。\n\\* 暂时使用十字街的其它聊天室。\n\\* 一段时间后再来尝试加入本聊天室。', socket);
      socket.close();
      return;
    }
  }

  // 生成用户列表
  let channelNicks = [];
  hold.channel[data.channel].socketList.forEach((item) => {
    if(!item.invisible) {
      channelNicks.push(item.nick);
    }
  });

  // 检查用户昵称是否和其他用户重复
  channelNicks.forEach((item) => {
    if (item.toLowerCase() == data.nick.toLowerCase()) {
      core.replyWarn('已经有人在这个聊天室使用这个昵称，请换一个昵称再试。', socket);
      socket.close();
      return;
    }
  });

  // 返回用户列表等信息
  if (typeof data.password == 'string') {
    const hash = createHash('sha256');
    hash.update(userInfo.trip + core.config.salts.auth, 'base64');
    core.reply({
      cmd: 'onlineSet',
      nicks: channelNicks,
      trip: userInfo.trip,
      key: hash.digest('base64').slice(0, 32),
      ver: core.config.verText
    }, socket);
  } else {
    core.reply({
      cmd: 'onlineSet',
      nicks: channelNicks,
      ver: core.config.verText
    }, socket);
  }

  // 广播用户上线信息
  if (!userInfo.invisible) {
    core.broadcast({
      cmd: 'onlineAdd',
      nick: userInfo.nick,
      trip: userInfo.trip || ' ',
      utype: userInfo.uType,
      level: userInfo.level,
      client: cName,
      channel: data.channel
    }, hold.channel[data.channel].socketList);
  }

  // 保存用户信息
  socket.nick = userInfo.nick;
  socket.trip = userInfo.trip;
  socket.uType = userInfo.uType;
  socket.level = userInfo.level;
  socket.channel = data.channel;
  socket.invisible = userInfo.invisible;
  
  // 将 socket 对象添加到聊天室的 socketList 中
  hold.channel[data.channel].socketList.add(socket);

  // 记录 stats
  core.increaseState('users-joined');

  // 写入存档
  if (userInfo.trip != null) {
    core.archive('JON', null, socket.remoteAddress + ' (' + userInfo.uType + ')[' + userInfo.trip + ']' + userInfo.nick + ' ' + data.channel);
  } else {
    core.archive('JON', null, socket.remoteAddress + ' (' + userInfo.uType + ')' + userInfo.nick + ' ' + data.channel);
  }

  return true;
}

export const moduleType = 'ws-command';
export const requiredData = ['channel', 'nick'];
export const name = 'join';
