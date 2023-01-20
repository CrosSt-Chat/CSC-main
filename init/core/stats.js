export async function run(hazel, core, hold) {
  core.increaseState = function (key) {
    if (!hold.stats[key]) { hold.stats[key] = 0; }
    hold.stats[key]++;
  }

  core.decreaseState = function (key) {
    if (!hold.stats[key]) { hold.stats[key] = 0; }
    hold.stats[key]--;
  }
}

export const priority = 32;
