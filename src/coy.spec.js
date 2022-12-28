let coy;
let fs;
let report;
let vueCompilerSfc;

describe('coy.js', () => {
  beforeEach(() => {
    global.process.exit = jest.fn();
    coy = require('./coy');
    fs = require('fs');
    report = require('../test/fixtures/report');
    vueCompilerSfc = require('@vue/compiler-sfc');

    fs.writeFileSync = jest.fn();
    coy.config = { regex: '(.+)?{key}(.+)?', paths: ['**'], testFileExtension: 'spec.js' };
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
    expect(coy.fileReducer({}, 'test/fixtures/index.vue')['test/fixtures/index.vue']).toBeFalsy();
    expect(coy.fileReducer({}, 'test/fixtures/missing.vue')['test/fixtures/missing.vue']).toBeTruthy();
    expect(coy.fileReducer({}, 'test/fixtures/no-test.vue')['test/fixtures/no-test.vue']).toBeTruthy();
    expect(coy.fileReducer({}, 'test/fixtures/ignored.vue')['test/fixtures/ignored.vue']).toBeFalsy();

    jest.spyOn(vueCompilerSfc, 'compileScript').mockImplementationOnce(() => {
      throw new Error('File not found');
    });
    expect(coy.fileReducer({}, 'test/fixtures/index.vue')).toEqual({});
  });

  test('main', () => {
    coy.fileReducer = jest.fn().mockReturnValue(report);
    coy.saveReport = jest.fn();
    coy.prettyPrintReport = jest.fn();

    coy.main({});
    expect(coy.prettyPrintReport).toHaveBeenCalled();

    coy.main({ save: true });
    expect(coy.saveReport).toHaveBeenCalled();
  });
});
