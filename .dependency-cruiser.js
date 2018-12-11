module.exports = {
  extends: 'dependency-cruiser/configs/recommended-strict',
  forbidden: [
    {
      name: 'not-to-test',
      severity: 'error',
      comment: 'src shall never depend on anything in test',
      from: {
        pathNot: '^test'
      },
      to: {
        path: '^test'
      }
    },
    {
      name: 'not-from-node_modules',
      severity: 'error',
      comment: 'node_modules depending on stuff in the src tree is positively weird',
      from: {
        path: '^node_modules'
      },
      to: {
        path: '^(src|test)'
      }
    },
    {
      name: 'not-from-utl',
      severity: 'error',
      comment: 'utl can be used by prod sources - but not the other way \'round',
      from: {
        path: '^src/utl'
      },
      to: {
        path: '^src'
      }
    },
    {
      name: 'not-from-test-utl',
      severity: 'error',
      comment: 'test/utl can be used by test sources - but not the other way \'round',
      from: {
        path: '^test/utl'
      },
      to: {
        path: '^(src|test)'
      }
    },
    {
      name: 'not-from-fixtures',
      severity: 'error',
      comment: 'don\'t let fixtures touch test or src code',
      from: {
        path: '^(test/fixtures|test/extractor-fixtures)'
      },
      to: {
        pathNot: '^(test/fixtures|test/extractor-fixtures)'
      }
    },
    {
      name: 'not-to-dev-dep',
      severity: 'error',
      comment: 'because an npm i --production will otherwise deliver an unreliably running module',
      from: {
        path: '^(bin|src)'
      },
      to: {
        dependencyTypes: [
          'npm-dev'
        ]
      }
    },
    {
      name: 'optional-deps-used',
      severity: 'error',
      comment: 'nothing serious - but just check you have some try/ catches around the import/ require of these',
      from: {},
      to: {
        dependencyTypes: [
          'npm-optional'
        ]
      }
    },
    {
      name: 'peer-deps-used',
      comment: 'peer dependencies are deprecated with the advent of npm 3 - and probably gone with version 4. Or with yarn.',
      severity: 'error',
      from: {},
      to: {
        dependencyTypes: [
          'npm-peer'
        ]
      }
    },
    {
      name: 'no-GPL-license',
      comment: 'Warn in case some dependency uses either GPL or APL (the licenses are OK, but your legal department might have 2nd thoughts about them)',
      severity: 'warn',
      from: {},
      to: {
        license: 'GPL|APL'
      }
    }
  ],
  options: {
    exclude: 'fixtures',
    // node_modules is already put on 'doNotFollow' in the recommended config
    // so no need to do this explicitly here anymore
    // doNotFollow: '^node_modules', 
    prefix: 'https://github.com/sverweij/js-makedepend/blob/master/'
  }
}
