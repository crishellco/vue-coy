const { Option, program } = require('commander');

const coy = require('./coy');

(function () {
  program
    .option('-c, --config <path>', 'path to config file')
    .addOption(new Option('-s, --save [file]', 'save report to a file').preset('missing-test-report.json'));
  program.parse();

  const options = program.opts();
  coy.main(options);
})();
