import { readdirSync } from 'node:fs';
import { join } from 'node:path';

function readDir(baseDir, resultArray) {
  let dirResult = readdirSync(
    baseDir,
    { encoding: 'utf-8', withFileTypes: true }
  );

  dirResult.forEach(value => {
    if (!value.isDirectory()) {
      resultArray.push(join(baseDir, value.name));
    } else {
      resultArray = readDir(join(baseDir, value.name), resultArray);
    }
  });

  return resultArray;
}

export default function recursiveReadDir(baseDir) {
  return readDir(baseDir, []);
}
