// 验证昵称、聊天室名、trip 等
export async function run(hazel, core, hold) {
  // 昵称目前的判断标准如下：
  // 昵称可以包含数字、字母、汉字和 _-+.:; 这些特殊字符
  // 总计不能超过 16 个字符
  // 汉字占 1.3 个字符
  // 一个昵称中最多只能有 3 个特殊字符
  core.verifyNickname = function (nick) {
    let charCount = nick.length;

    // 使用正则表达式匹配汉字，汉字占 1.3 个字符
    charCount += (nick.match(/[\u4e00-\u9fa5]/g) || []).length * 0.3;

    // 使用正则表达式匹配特殊字符，一个昵称中最多只能有 3 个特殊字符
    if ((nick.match(/[-_+.:;]/g) || []).length > 3) { return false; }

    return /^[a-zA-Z0-9\u4e00-\u9fa5_\-+.:;]{1,16}$/.test(nick) && charCount <= 16;
  }

  // 判断聊天室名是否合法
  core.verifyChannel = function (channel) {
    return /^[a-zA-Z0-9\u4e00-\u9fa5_\-]{1,20}$/.test(channel);
  }

  // 判断 trip 是否合法
  core.verifyTrip = function (trip) {
    return /^[a-zA-Z0-9+/]{6}$/.test(trip);
  }
}

export const priority = 0;
