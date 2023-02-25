const { Option, program } = require('commander');

const coy = require('./coy');

(function () {
  program
    .addOption(new Option('-s, --save [file]', 'save report to a file').preset('missing-test-report.json'))
    .addOption(new Option('-c, --changed [branch]', 'only changed files').preset('master'))
    .option('-w, --watch', 'watch for changes');
  program.parse();

  const options = program.opts();

  if (options.watch) options.save = false;

  coy.main(options);
})();
