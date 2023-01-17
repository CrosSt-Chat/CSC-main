import recursiveReadDir from './recursive-readdir.js';
import { copyFileSync, mkdirSync, rmSync } from 'fs';

export default async function loadDir( hazel, dirName, loadType ) {
  let existError = false;

  const modulePathList = recursiveReadDir( dirName );
  const tempFolder = hazel.mainConfig.baseDir + '/.temp-' + Math.random().toString().slice( -8 ) + '/';

  if ( !hazel.mainConfig.hazel.debuggingMode ) {
    try {
      mkdirSync( tempFolder );
    } catch ( error ) {
      existError = true;
      this.emit('error', error );
      console.error( error );
      return false;
    }
  }

  let moduleList;
  if ( loadType == 'function' ) {
    moduleList = new Map();
  } else if ( loadType == 'init' ){
    moduleList = new Array();
  }

  for ( const filePath of modulePathList ) {
    if ( !filePath.includes('/_') && ( filePath.endsWith('.js') || filePath.endsWith('.mjs'))) {
      console.log('* Initializing ' + filePath + ' ...');
      let currentModule;
      try {
        if ( hazel.mainConfig.hazel.debuggingMode ) {
          currentModule = await import('file:///' + filePath );
        } else {
          let tempFileName = filePath.split('/').pop().split('.')[0] + '-' + Math.random().toString(36).slice(-8) + '.js';
          copyFileSync( filePath, tempFolder + tempFileName );
          currentModule = await import('file:///' + tempFolder + tempFileName );
        }
      } catch ( error ) {
        hazel.emit('error', error );
        console.error( error );
        existError = true;
        continue;
      }
      
      if ( typeof currentModule.run != 'function' ) {
        hazel.emit('error', new Error( filePath + ' should export a function named "run".'));
        console.error( filePath + ' should export a function named "run".');
        existError = true;
        continue;
      }

      if ( loadType == 'function' && typeof currentModule.name != 'string') {
        hazel.emit('error', new Error( filePath + ' should export a string named "name" as the function name.'));
        console.error( filePath + ' should export a string named "name" as the function name.');
        existError = true;
        continue;
      } else if ( loadType == 'init' && typeof currentModule.priority != 'number') {
        hazel.emit('error', new Error( filePath + ' should export a number named "priority" to declare the priority of the module.'));
        console.error( filePath + ' should export a number named "priority" to declare the priority of the module.');
        existError = true;
        continue;
      }
      
      if ( loadType == 'function') {
        moduleList.set( currentModule.name, currentModule );
        continue;
      } else if ( loadType == 'init'){
        moduleList.push( currentModule );
        continue;
      }
    }
  }

  if ( !hazel.mainConfig.hazel.debuggingMode ) {
    try {
      rmSync( tempFolder, { recursive: true });
    } catch ( error ) {
      hazel.emit('error', error );
      console.error( error );
    }
  }

  if ( loadType == 'init') {
    moduleList.sort(( first, last ) => first.priority - last.priority );
  }

  return { moduleList, existError };  
}
