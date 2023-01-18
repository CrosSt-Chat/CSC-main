export async function run(hazel, core, hold) {
  core.increaseState = function (key) {
    if (!core.stats[key]) { core.stats[key] = 0; }
    core.stats[key]++;
  }

  core.decreaseState = function (key) {
    if (!core.stats[key]) { core.stats[key] = 0; }
    core.stats[key]--;
  }
}
export const priority = 32;
