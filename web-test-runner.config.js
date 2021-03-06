/* eslint-env node */
require('dotenv').config();
const { filterBrowserLogs, getUnitTestGroups, getUnitTestPackages, testRunnerHtml } = require('./wtr-utils.js');

const packages = getUnitTestPackages();
const groups = getUnitTestGroups(packages);

module.exports = {
  nodeResolve: true,
  browserStartTimeout: 60000, // default 30000
  testsStartTimeout: 60000, // default 10000
  testsFinishTimeout: 60000, // default 20000
  coverageConfig: {
    include: ['packages/**/src/*', 'packages/**/*.js'],
    threshold: {
      statements: 75,
      branches: 50,
      functions: 70,
      lines: 75
    }
  },
  testFramework: {
    config: {
      ui: 'bdd',
      timeout: '10000'
    }
  },
  groups,
  testRunnerHtml,
  filterBrowserLogs
};
