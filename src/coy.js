const simpleGit = require('simple-git');
const fs = require('fs');
const chokidar = require('chokidar');
const path = require('path');
const vueCompilerSfc = require('@vue/compiler-sfc');
const chalk = require('chalk');
const glob = require('glob');
const { camelCase, get, fill, defaults, mapValues, groupBy, trim, map, intersection } = require('lodash');
const { DEFAULT_CONFIG, IGNORE_COMMENT, GROUPS_TO_TEST, HOOKS_TO_TEST } = require('./constants');

module.exports = {
  config: {},

  log(...args) {
    return console.log(...args);
  },

  prettyPrintReport(report, watch = false) {
    let total = 0;

    this.log(chalk.blue(fill(Array(70), '-').join('')));

    for (const file in report) {
      const { testFile, testSource, missing } = report[file];
      this.log(
        chalk.blue(file),
        chalk.gray('[', testFile, testSource === null ? '(Test file is missing)' : '(Test file found)', ']')
      );
      for (const parentKey in missing) {
        const missingProps = missing[parentKey];

        total += missingProps.length;

        missingProps.length && this.log('  ⮑ ', chalk.magenta(parentKey, `(${missingProps.length})`));
        missingProps.forEach((missingProp) => {
          this.log(chalk.green('     ⮑ ', missingProp.link, missingProp.key));
        });
      }
    }
    this.log(chalk.blue(fill(Array(70), '-').join('')));
    this.log(chalk.white('Total missing:'), chalk.red(total));
    this.log(chalk.blue(fill(Array(70), '-').join('')));

    if (total && !watch) return process.exit(1);
  },

  saveReport(report, file) {
    fs.writeFileSync(file, JSON.stringify(report, null, 2));
  },

  fileReducer(report, file) {
    const testFile = file.replace('.vue', `.${this.config.testFileExtension}`);
    const filePath = path.join(process.cwd(), file);
    const testPath = path.join(process.cwd(), testFile);
    let testSource = null;
    let sfcParts = [];

    try {
      testSource = fs.readFileSync(testPath, 'utf-8').replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    } catch (error) {
      //
    }

    const { descriptor } = vueCompilerSfc.parse(fs.readFileSync(filePath, 'utf8'), {});

    try {
      sfcParts = vueCompilerSfc.compileScript(descriptor, { id: camelCase(file), sourceMap: true }).scriptAst;
    } catch (error) {
      return report;
    }

    const component = sfcParts.find((part) => part.type === 'ExportDefaultDeclaration');

    const nodes = get(component, 'declaration.properties', []).filter((node) => {
      return [...HOOKS_TO_TEST, ...GROUPS_TO_TEST].includes(get(node, 'key.name'));
    });
    const toBeTested = nodes.reduce((result, node) => {
      const parent = get(node, 'key.name');
      const comments = map(node.leadingComments, ({ value }) => trim(value)).join();

      if (HOOKS_TO_TEST.includes(parent) && !comments.includes(IGNORE_COMMENT)) {
        return result.concat({
          ...node,
          key: parent,
          parent: 'hooks',
        });
      }

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
      const regex = new RegExp(this.config.regex.replace('{key}', key), 'g');

      return !regex.test(testSource || '');
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
  },

  async main(options) {
    let userConfig;

    try {
      userConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'coy.config.json')));
    } catch (error) {
      this.log(chalk.blue('Info'), 'Config file missing - using defaults.');
      userConfig = {};
    }

    this.config = defaults(userConfig, DEFAULT_CONFIG);
    const onChange = async () => {
      let files = glob.sync(`@(${this.config.paths.join('|')})/**/*.vue`, { ignore: this.config.ignore });

      if (options.changed) {
        const git = simpleGit();
        const diff = await git.diffSummary([`${options.changed}`]);
        const changed = map(diff.files, 'file');
        files = intersection(files, changed);
      }

      const report = files.reduce((report, file) => this.fileReducer(report, file), {});

      options.save ? this.saveReport(report, options.save) : this.prettyPrintReport(report, options.watch);
    };

    await onChange();

    if (options.watch) {
      chokidar
        .watch(`@(${this.config.paths.join('|')})/**/*.(vue|${this.config.testFileExtension})`, {
          ignored: this.config.ignore,
          awaitWriteFinish: {
            stabilityThreshold: 500,
            pollInterval: 100,
          },
        })
        .on('change', onChange);
    }
  },
};
