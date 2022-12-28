module.exports = {
  'pages/index.vue': {
    missing: {
      methods: [
        {
          key: 'foo',
          link: 'pages/index.vue:10',
        },
      ],
    },
    testFile: 'pages/index.spec.js',
    testSource: "describe('index.vue', () => {\n  describe('methods', () => {});\n});\n",
  },
};
