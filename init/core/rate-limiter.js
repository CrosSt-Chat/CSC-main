// 频率限制器，可以判断一个 IP 的请求频率是否过高，
// 也可以显示全局的频率

var lastRateTime = Date.now();

export async function run( hazel, core, hold ) {

  // 检查一个 IP 的状态
  core.checkAddress = function (remoteAddress, score) {
    if (typeof hold.rateRecords[remoteAddress] == 'undefined') {
      hold.rateRecords[remoteAddress] = {
        lastRateTime: Date.now(),
        score: 0
      }
    }

    hold.rateRecords[remoteAddress].score *= Math.pow(2, -(Date.now() - hold.rateRecords[remoteAddress].lastRateTime) / core.config.rateLimiter.halfScoreTime);
    hold.rateRecords[remoteAddress].score += score;
    hold.rateRecords[remoteAddress].lastRateTime = Date.now();

    if (hold.rateRecords[remoteAddress].score >= core.config.rateLimiter.limit) {
      return true;
    }

    return false;
  }

  // 计入全局频率
  core.increaseGlobalRate = function () {
    let thisTime = Date.now();
  
    if ( thisTime - lastRateTime >= core.config.rateLimiter.globalTimeRange ) {
      hold.perviousRate = 60000;
    } else {
      hold.perviousRate = ( core.config.rateLimiter.globalTimeRange * hold.perviousRate ) / ( core.config.rateLimiter.globalTimeRange - ( thisTime - lastRateTime) + hold.perviousRate );
    }
  
    lastRateTime = thisTime;
  
    return;
  }

  // 返回服务器的估计全局频率 单位：次每分钟
  core.getFrequency = function () {
    return ( core.config.rateLimiter.globalTimeRange * core.config.rateLimiter.globalTimeRange) / ( hold.perviousRate * 60000 );
  }
}

export const priority = 3;
