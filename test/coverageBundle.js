const allTests = require.context('.', true, /.spec\.js$/);

allTests.keys().forEach(allTests);

const allSources = require.context('../lib', true, /.*\.js$/);

allSources.keys().forEach(allSources);