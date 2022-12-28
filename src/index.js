const fs = require('fs');
const path = require('path');
const { parse, compileScript } = require('@vue/compiler-sfc');
const chalk = require('chalk');
const { Option, program } = require('commander');
const glob = require('glob');
const { camelCase, get, fill, defaults, mapValues, groupBy, trim, map } = require('lodash');

const defaultConfig = { paths: ['**'], testFileExtension: 'spec.js' };
const IGNORE_COMMENT = 'coy-ignore-next';
const THINGS_TO_TEST = ['watch', 'computed', 'methods'];

let config = {};

function log(...args) {
  return console.log(...args);
}

function prettyPrintReport(report) {
  let total = 0;

  log(chalk.blue(fill(Array(70), '-').join('')));

  for (const file in report) {
    const { testFile, testSource, missing } = report[file];
    log(
      chalk.blue(file),
      chalk.gray('[', testFile, testSource === null ? '(Test file is missing)' : '(Test file found)', ']')
    );
    for (const parentKey in missing) {
      const missingProps = missing[parentKey];

      total += missingProps.length;

      missingProps.length && log('  ⮑ ', chalk.magenta(parentKey, `(${missingProps.length})`));
      missingProps.forEach((missingProp) => {
        log(chalk.green('     ⮑ ', missingProp.link, missingProp.key));
      });
    }
  }
  log(chalk.blue(fill(Array(70), '-').join('')));
  log(chalk.white('Total missing:'), chalk.red(total));
  log(chalk.blue(fill(Array(70), '-').join('')));

  if (total) return process.exit(1);
}

function saveReport(report, file) {
  fs.writeFileSync(file, JSON.stringify(report, null, 2));
}

function fileReducer(report, file) {
  const testFile = file.replace('.vue', `.${config.testFileExtension}`);
  const filePath = path.join(process.cwd(), file);
  const testPath = path.join(process.cwd(), testFile);
  let testSource = null;
  let sfcParts = [];

  try {
    testSource = fs.readFileSync(testPath, 'utf-8');
  } catch (error) {
    //
  }

  const { descriptor } = parse(fs.readFileSync(filePath, 'utf8'), {});

  try {
    sfcParts = compileScript(descriptor, { id: camelCase(file), sourceMap: true }).scriptAst || [];
  } catch (error) {
    return report;
  }

  const component = sfcParts.find((part) => part.type === 'ExportDefaultDeclaration');

  const nodes = get(component, 'declaration.properties', []).filter((node) => {
    return THINGS_TO_TEST.includes(get(node, 'key.name'));
  });

  const toBeTested = nodes.reduce((result, node) => {
    const parent = get(node, 'key.name');

    return result.concat(
      get(node.value, 'properties', [])
        .map((property) => ({
          ...property,
          key: get(property, 'key.name'),
          parent,
        }))
        .filter((node) => {
          const comments = map(node.leadingComments, ({ value }) => trim(value)).join();

          return node.key && !comments.includes(IGNORE_COMMENT);
        })
    );
  }, []);

  let missing = toBeTested.filter((node) => {
    const key = node.key;
    const regex = new RegExp(`'(.+)?${key}(.+)?'`, 'g');

    return key && !regex.test(testSource || '');
  });

  missing = groupBy(missing, 'parent');
  missing = mapValues(missing, (keys) => {
    return keys.map(({ key, loc }) => ({
      key,
      link: `${file}:${loc.start.line + descriptor.script.loc.start.line - 1}`,
    }));
  });

  if (!Object.keys(missing).length) return report;

  return {
    ...report,
    [file]: {
      missing,
      testFile,
      testSource,
    },
  };
}

(function () {
  program
    .option('-c, --config <path>', 'path to config file')
    .addOption(new Option('-s, --save [file]', 'save report to a file').preset('missing-test-report.json'));
  program.parse();

  const options = program.opts();

  let userConfig;
  try {
    userConfig = require(`${process.cwd()}/${options.config || 'coy.config.js'}`);
  } catch (error) {
    log(chalk.blue('Info'), 'Config file missing - using defaults.');
    userConfig = {};
  }

  config = defaults(userConfig, defaultConfig);
  const files = glob.sync(`@(${config.paths.join('|')})/**/*.vue`);
  const report = files.reduce(fileReducer, {});

  options.save ? saveReport(report, options.save) : prettyPrintReport(report);
})();
