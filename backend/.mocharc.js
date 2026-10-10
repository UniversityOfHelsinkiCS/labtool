// Replaces test/mocha.opts, which mocha no longer reads. Spec files default to ./test/*.js;
// pass file names on the command line to run only those.
module.exports = {
  exit: true,
  timeout: 15000,
  reporter: 'spec',
  file: ['test/helpers/setup.js']
}
