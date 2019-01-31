const babel = require('@babel/core')
const tape = require('tape')

tape('should transform', t => {
  const result = babel.transform(`import foo from 'foobar';`.trim(), {
    plugins: [require.resolve('../src/index.js')]
  })
  t.equal(result.code, 'const foo = require("foobar");')
  t.end()
})