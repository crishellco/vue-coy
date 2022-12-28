<p align="center">
  <img src="https://github.com/crishellco/vue-coy/workflows/Build/badge.svg" alt="Build">
  <a href="https://codecov.io/gh/crishellco/vue-coy"><img src="https://codecov.io/gh/crishellco/vue-coy/branch/master/graph/badge.svg?token=M7N86U5GF7" alt="codecov"></a>
  <a href="https://codeclimate.com/github/crishellco/vue-coy/maintainability"><img src="https://api.codeclimate.com/v1/badges/10d5790796ad8b2f166c/maintainability" alt="Maintainability"></a>
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

### When should you use it?

*   in your test suite
*   in your pre-commit hooks
*   in your builds
*   manually as a sanity check

### Config (optional)

```js
// coy.config.js
module.exports = {
  paths: ['**'], 
  regex: '(.+)?{key}(.+)?', 
  testFileExtension: 'spec.js' 
}
```

#### Options

| Name                | Type     | Default             | Description                               |
|---------------------|----------|---------------------|-------------------------------------------|
| `paths`             | `Array`  | `['**']`            | Where to look for Vue files (globs)       |
| `regex`             | `String` | `'(.+)?{key}(.+)?'` | How to determine if a test exists (regex) |
| `testFileExtension` | `String` | `'spec.js'`         | Test file extension                       |

### Command Line

```bash
# in a project
$ yarn coy 
$ yarn coy -c path/to/coy.config.js
$ yarn coy -s
$ yarn coy -s path/to/save/report.json

# globally 
$ coy 
$ coy -c path/to/coy.config.js
$ coy -s
$ coy -s path/to/save/report.json
```

#### Options

| Flag           | Argument          | Default                    | Description                              |
|----------------|-------------------|----------------------------|------------------------------------------|
| `-c, --config` | `path`            |                            | Loads a specific config file             |
| `-s, --save`   | `file` (optional) | `missing-test-report.json` | Saves missing test report to a JSON file |
| `-h, --help`   |                   |                            | Display help for command                 |

#### Display In Terminal (default)

![image](https://user-images.githubusercontent.com/1878509/209841527-fe8c952e-bc1c-43a4-9939-7973453e51c3.png)

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