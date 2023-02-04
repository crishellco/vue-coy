const { DEFAULT_CONFIG } = require('./constants');

let chokidar;
let coy;
let fs;
let report;
let vueCompilerSfc;

describe('coy.js', () => {
  beforeEach(() => {
    global.process.exit = jest.fn();
    chokidar = require('chokidar');
    coy = require('./coy');
    fs = require('fs');
    report = require('../test/fixtures/report');
    vueCompilerSfc = require('@vue/compiler-sfc');

    fs.writeFileSync = jest.fn();
    coy.config = DEFAULT_CONFIG;
  });

  test('log', () => {
    const originalLog = global.console.log;
    global.console.log = jest.fn();

    coy.log();
    expect(global.console.log).toHaveBeenCalled();

    global.console.log = originalLog;
  });

  test('prettyPrintReport', () => {
    coy.log = jest.fn();

    coy.prettyPrintReport({});
    expect(global.process.exit).not.toHaveBeenCalled();

    coy.log.mockReset();
    coy.prettyPrintReport(report);
    expect(coy.log).toHaveBeenCalledTimes(7);
    expect(coy.log.mock.calls[1][1]).toContain('found');
    expect(global.process.exit).toHaveBeenCalledWith(1);

    coy.log.mockReset();
    global.process.exit.mockReset();
    coy.prettyPrintReport(report, true);
    expect(global.process.exit).not.toHaveBeenCalled();

    coy.log.mockReset();
    report['pages/index.vue'].testSource = null;
    coy.prettyPrintReport(report);
    expect(coy.log).toHaveBeenCalledTimes(7);
    expect(coy.log.mock.calls[1][1]).toContain('missing');
  });

  test('saveReport', () => {
    coy.saveReport(report, 'file.json');
    expect(fs.writeFileSync).toHaveBeenCalledWith('file.json', expect.any(String));
  });

  test('fileReducer', () => {
    expect(coy.fileReducer({}, 'test/fixtures/ignored.vue')['test/fixtures/ignored.vue']).toBeFalsy();
    expect(coy.fileReducer({}, 'test/fixtures/index.vue')['test/fixtures/index.vue']).toBeTruthy();
    expect(coy.fileReducer({}, 'test/fixtures/missing.vue')['test/fixtures/missing.vue']).toBeTruthy();
    expect(coy.fileReducer({}, 'test/fixtures/no-test.vue')['test/fixtures/no-test.vue']).toBeTruthy();

    jest.spyOn(vueCompilerSfc, 'compileScript').mockImplementationOnce(() => {
      throw new Error('File not found');
    });
    expect(coy.fileReducer({}, 'test/fixtures/ignored.vue')).toEqual({});
    expect(coy.fileReducer({}, 'test/fixtures/index.vue')['test/fixtures/index.vue'].missing.hooks[0].key).toBe(
      'beforeMount'
    );
    expect(coy.fileReducer({}, 'test/fixtures/missing.vue')['test/fixtures/missing.vue'].missing.methods[0].key).toBe(
      'foo'
    );
    expect(coy.fileReducer({}, 'test/fixtures/no-test.vue')['test/fixtures/no-test.vue'].missing.methods[0].key).toBe(
      'foo'
    );
  });

  test('main', () => {
    chokidar.watch = jest.fn().mockReturnValue({ on: jest.fn() });
    coy.fileReducer = jest.fn().mockReturnValue(report);
    coy.saveReport = jest.fn();
    coy.prettyPrintReport = jest.fn();

    coy.main({});
    expect(coy.prettyPrintReport).toHaveBeenCalled();

    coy.main({ save: true });
    expect(coy.saveReport).toHaveBeenCalled();

    coy.main({ watch: true });
    expect(chokidar.watch).toHaveBeenCalled();
  });
});
