export async function run( hazel, core, hold ) {
  // Event 'error' will emit when any core error occured.
  hazel.on('error', error => {});

  // Event 'initialied' will emit when the core is initialized.
  hazel.on('initialied', () => {});

  // Event 'reload-start' will emit when the core is reloading.
  hazel.on('reload-start', () => {});

  // Event 'reload-complete' will emit when the core is reloaded.
  hazel.on('reload-complete', () => {});
}

export const priority = -1;
