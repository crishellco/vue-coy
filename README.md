<p align="center">
  <img src="https://github.com/crishellco/vue-coy/workflows/Build/badge.svg" alt="Build">
  <a href="https://codecov.io/gh/crishellco/vue-coy"><img src="https://codecov.io/gh/crishellco/vue-coy/branch/master/graph/badge.svg?token=M7N86U5GF7" alt="codecov"></a>
  <a href="https://codeclimate.com/github/crishellco/vue-coy/maintainability"><img src="https://api.codeclimate.com/v1/badges/ca1e6a9e7fe67a750024/maintainability" /></a>
  <br>
</p>

# Vue Coy

A CLI tool to help identify missing Vue component tests.

## Table of contents

*   [Install](#install)
*   [Usage](#usage)
    *   [Config (optional)](#config-optional)
        *   [Options](#options)
    *   [Command Line](#command-line)
        *   [Options](#options-1)
        *   [Display In Terminal (default)](#display-in-terminal-default)
        *   [Save To File (with `-s`)](#save-to-file-with--s)
    *   [Ignoring Code](#ignoring-code)
*   [How to Contribute](#how-to-contribute)
    *   [Pull Requests](#pull-requests)
*   [License](#license)

## Install

```bash
# in a project
yarn add -D @crishellco/vue-coy

# globally 
yarn global add @crishellco/vue-coy
```

## Usage

### What does it look for?

```js
exports.GROUPS_TO_TEST = ['watch', 'computed', 'methods'];
exports.HOOKS_TO_TEST = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'activated',
  'deactivated',
  'beforeUnmount',
  'unmounted',
  'beforeDestroy',
  'destroyed',
  'renderTracked',
  'renderTriggered',
  'errorCaptured',
];
```

### When should you use it?

*   in your test suite
*   in your pre-commit hooks
*   in your builds
*   manually as a sanity check

### Config (optional)

```js
// coy.config.json
{
  "ignore": ["node_modules"],
  "paths": ["**"], 
  "regex": "(.+)?{key}(.+)?", 
  "testFileExtension": "spec.js" 
}
```

#### Options

| Name                | Type     | Default                  | Description                                                                                         |
|---------------------|----------|--------------------------|-----------------------------------------------------------------------------------------------------|
| `ignore`            | `Array`  | `['**/node_modules/**']` | Which folders to ignore (globs)                                                                     |
| `paths`             | `Array`  | `['**']`                 | Where to look for Vue files (globs)                                                                 |
| `regex`             | `String` | `'(.*?{key}.*?)'`        | How to determine if a test exists (regex). `{key}` gets replaced with the name of the missing item. |
| `testFileExtension` | `String` | `'spec.js'`              | Test file extension                                                                                 |

### Command Line

```bash
# in a project
$ yarn coy 
$ yarn coy -s
$ yarn coy -s path/to/save/report.json
$ yarn coy -w

# globally 
$ coy 
$ coy -s
$ coy -s path/to/save/report.json
$ coy -w
```

#### Options

| Flag          | Argument          | Default                    | Description                                    |
|---------------|-------------------|----------------------------|------------------------------------------------|
| `-s, --save`  | `file` (optional) | `missing-test-report.json` | Saves missing test report to a JSON file       |
| `-w, --watch` |                   |                            | watch for changes and reevaluate missing tests |
| `-h, --help`  |                   |                            | Display help for command                       |

#### Display In Terminal (default)

![image](https://user-images.githubusercontent.com/1878509/209883989-30dc37fd-082e-49d3-a148-c0c451310b18.png)

#### Save To File (with `-s`)

```json
{
  "test/fixtures/missing.vue": {
    "missing": {
      "methods": [
        {
          "key": "foo",
          "link": "test/fixtures/missing.vue:10"
        }
      ]
    },
    "testFile": "test/fixtures/missing.spec.js",
    "testSource": "describe('index.vue', () => {\n  describe('methods', () => {});\n});\n"
  },
  "test/fixtures/no-test.vue": {
    "missing": {
      "methods": [
        {
          "key": "foo",
          "link": "test/fixtures/no-test.vue:10"
        }
      ]
    },
    "testFile": "test/fixtures/no-test.spec.js",
    "testSource": null
  }
}
```

### Ignoring Code

```vue
<script>
  export default {
    methods: {
      // coy-ignore-next
      foo() {}
    }
  }
</script>
```

## How to Contribute

### Pull Requests

1.  Fork the repository
2.  Create a new branch for each feature or improvement
3.  Please follow [semantic-release commit format](https://semantic-release.gitbook.io/semantic-release/#commit-message-format)
4.  Send a pull request from each feature branch to the **develop** branch

## License

[MIT](http://opensource.org/licenses/MIT)
