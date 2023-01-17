// This is a example of Hazel Core function.
// A function should include 'run()' and 'name'

//                         /Hazel Core argv\  /your argvs\
export async function run( hazel, core, hold, argv1, argv2) {
  console.log( argv1 + ' ' + argv2 );

  /*                             /name\ / argvs \
  let result = hazel.runFunction( 'xx', foo, bar );  // run a loaded function.
  let result = hazel.reloadModules( isForce );       // reload functions and inits.
  return: 'false' means reload fail or '{ existError: true/false }'
  */

  return;
}

export const name = 'example';
