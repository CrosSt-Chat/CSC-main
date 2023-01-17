import HazelCore from './hazel/hazel-core.js';
import { readFileSync } from 'fs';

let defaultConfigPath = import.meta.url.slice( 8, import.meta.url.lastIndexOf('/')) + '/config.json';
if ( process.argv.includes('--config-path')) {
  if ( typeof ( process.argv[ process.argv.indexOf('--config-path') + 1 ]) != 'undefined' ) {
    defaultConfigPath = process.argv[ process.argv.indexOf('--config-path') + 1 ];
  }
}

const mainConfig = JSON.parse( readFileSync( defaultConfigPath, { encoding: 'utf-8', flag: 'r'}));

mainConfig.baseDir = import.meta.url.slice( 8, import.meta.url.lastIndexOf('/'));

const hazel = new HazelCore( mainConfig );
hazel.initialize( process.argv.includes('--force'));
