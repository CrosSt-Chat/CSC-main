// 用于管理 /config/config.json 文件，一个可能需要经常修改的配置文件

import { readFileSync, watch, writeFileSync } from 'fs';
import { join } from 'path';

export async function run(hazel, core, hold) {
  // 配置文件的路径
  const configPath = join(hazel.mainConfig.baseDir, hazel.mainConfig.appConfigDir);
  // 从指定的路径加载配置文件
  try {
    core.config = JSON.parse(readFileSync(configPath, { encoding: 'utf-8'}));
  } catch (error) {
    hazel.emit('error', error);
    core.config = {};
  }

  // 监听配置文件的变化
  watch(configPath, { encoding: 'utf-8' }, async (eventType) => {
    if (eventType == 'change') {
      try {
        await (new Promise(( resolve, reject ) => { setTimeout(resolve, 300); }));
        core.config = JSON.parse(readFileSync(configPath, { encoding: 'utf-8' }));
      } catch (error) {
        hazel.emit('error', error);
        return;
      }
    }
  });

  // 保存配置文件
  core.saveConfig = function() {
    try {
      writeFileSync(configPath, JSON.stringify(core.config, null, 2), { encoding: 'utf-8' });
    } catch (error) {
      hazel.emit('error', error);
    }
  }
}

export const priority = 1;
