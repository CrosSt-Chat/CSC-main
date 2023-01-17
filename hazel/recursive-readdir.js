import { readdirSync } from 'fs';

function readDir( dir, pushedResult ) {
  let dirResult = readdirSync( dir, { encoding: 'utf-8', withFileTypes: true });

  dirResult.forEach( value => {
    if ( !value.isDirectory()) {
      pushedResult.push( dir + '/' + value.name );
    } else {
      pushedResult = readDir( dir + '/' + value.name, pushedResult );
    }
  });

  return pushedResult;
}

export default function recursiveReadDir( baseDir ) {
  if ( typeof baseDir != 'string' ) {
    throw new Error('The argument "baseDir" must be a string, received type ' + typeof baseDir );
  } else if ( baseDir.endsWith('/')) {
    baseDir = baseDir.slice( 0, baseDir.length - 1 );
  }

  return readDir( baseDir, []);
}
