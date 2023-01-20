import loadModule from './module-loader.js';
import EventEmitter from 'events';

export default class Hazel extends EventEmitter {
  constructor( mainConfig ) {
    super();
    this.mainConfig = mainConfig;
    this.loadedFunctions = new Map();

    process.on('unhandledRejection', ( error ) => {
      this.emit('error', error );
    });
  }

  #core = {};
  #hold = {};

  async initialize( forceInit ) {
    console.log('Initializing ' + this.mainConfig.projectName + '...\n');

    if (( await this.loadModules( forceInit )) || forceInit ) {
      ( await import('file:///' + this.mainConfig.baseDir + this.mainConfig.hazel.moduleDirs.staticDir )).default( this, this.#core, this.#hold )
        .then()
        .catch(( error ) => {
          this.emit('error', error );
          console.error( error );
          if ( !forceInit ) {
            process.exit();
          }
        });
    } else {
      process.exit();
    }

    console.log('√ Static function executed.');

    this.emit('initialied');
    console.log('==' + this.mainConfig.projectName + ' Initialize Complete==');

    return;
  }

  async reloadModules( forceReload ) {
    this.emit('reload-start');
    if ( !forceReload && await this.loadModules( forceReload || false ) == false ) {
      return false;
    }
    this.emit('reload-complete');
    return true;
  }

  async runFunction( functionName, ...functionArgs ) {
    if ( !this.loadedFunctions.has( functionName )) {
      this.emit('error', new Error('The function name \'' + functionName + '\' do not exist.'));
      console.error('The function name \'' + functionName + '\' do not exist.');
      return false;
    }

    let result;
    let targetFunction = this.loadedFunctions.get( functionName ).run;
    try {
      result = await targetFunction( this, this.#core, this.#hold, ...functionArgs );
    } catch ( error ) {
      this.emit('error', error );
      console.error( error );
      return false;
    }
    
    return result;
  }

  async loadModules( forceLoad ) {
    let { moduleList: loadedInits, existError: initsExistError } = await loadModule( this, this.mainConfig.baseDir + this.mainConfig.hazel.moduleDirs.initsDir, 'init');
    if ( !forceLoad && initsExistError ) {
      return false;
    }

    this.removeAllListeners();
    this.on('error', () => {});

    for ( let property in this.#core ) { delete this.#core[ property ]; }
    loadedInits.forEach( initFunction => {
      initFunction.run( this, this.#core, this.#hold )
        .catch(( error ) => {
          this.emit('error', error );
          console.error( error );
          if ( !forceLoad ) {
            return false;
          }
        });
    });

    console.log('√ Initialize inits complete!\n');

    let { moduleList: loadedFunctions, existError: functionExistError } = await loadModule( this, this.mainConfig.baseDir + this.mainConfig.hazel.moduleDirs.functionsDir, 'function');
    if ( !forceLoad && functionExistError ) {
      return false;
    }

    this.loadedFunctions = loadedFunctions;

    console.log('√ Initialize functions complete!\n');

    return !( initsExistError || functionExistError );
  }
}
