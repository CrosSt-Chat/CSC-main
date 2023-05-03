import recursiveReadDir from './recursive-readdir.js';
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export default async function loadDir(hazel, dirName, loadType) {
  let existError = false;

  let tempFolder = '';

  if (!hazel.mainConfig.hazel.debuggingMode) {
    tempFolder = resolve('.temp-' + Math.random().toString().slice(-8) + '/');
    try {
      mkdirSync(tempFolder);
      cpSync(dirName, tempFolder, {
        recursive: true
      });
      dirName = tempFolder;
    } catch (error) {
      existError = true;
      this.emit('error', error);
      console.error(error);
      return false;
    }
  }

  let moduleList;
  if (loadType === 'function') {
    moduleList = new Map();
  } else if (loadType === 'init'){
    moduleList = new Array();
  }

  for (const filePath of recursiveReadDir(dirName)) {
    if (!filePath.includes('/_') && (filePath.endsWith('.js') || filePath.endsWith('.mjs'))) {
      console.log('* Initializing ' + filePath + ' ...');
      let currentModule;
      try {
        currentModule = await import(pathToFileURL(filePath));
      } catch (error) {
        hazel.emit('error', error);
        console.error(error);
        existError = true;
        continue;
      }
      
      if ( typeof currentModule.run != 'function' ) {
        hazel.emit('error', new Error( filePath + ' should export a function named "run".'));
        console.error( filePath + ' should export a function named "run".');
        existError = true;
        continue;
      }

      if ( loadType === 'function' && typeof currentModule.name != 'string') {
        hazel.emit('error', new Error( filePath + ' should export a string named "name" as the function name.'));
        console.error( filePath + ' should export a string named "name" as the function name.');
        existError = true;
        continue;
      } else if ( loadType === 'init' && typeof currentModule.priority != 'number') {
        hazel.emit('error', new Error( filePath + ' should export a number named "priority" to declare the priority of the module.'));
        console.error( filePath + ' should export a number named "priority" to declare the priority of the module.');
        existError = true;
        continue;
      }
      
      if ( loadType === 'function') {
        moduleList.set( currentModule.name, currentModule );
      } else if ( loadType === 'init'){
        moduleList.push( currentModule );
      }
    }
  }

  if (!hazel.mainConfig.hazel.debuggingMode) {
    try {
      rmSync(tempFolder, { recursive: true });
    } catch (error) {
      hazel.emit('error', error);
      console.error(error);
    }
  }

  if ( loadType === 'init') {
    moduleList.sort(( first, last ) => first.priority - last.priority );
  }

  return { moduleList, existError };  
}
