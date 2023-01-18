export async function run(hazel, core, hold) {
  hazel.on('error', error => {
    console.error(error);

    // 记日志
    core.log(core.LOG_LEVEL.ERROR, [
      'ERROR:', error.message,
      '\n', error.stack,
      '\n----------'
    ]);
  });
}

export const priority = -1;
