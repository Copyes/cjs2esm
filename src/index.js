function translate(modules, name) {
  modules = typeof modules === 'string' ? [modules] : modules
  if(Array.isArray(modules)){
    return module.includes(name)
  }
  return true
}
module.exports = function({template, types: t}){
  
  return {
    visitor: {
      ImportDeclaration(nodePath, {opts}){
        const specifiers = nodePath.get('specifiers')
        if(specifiers && specifiers.length > 0){
          specifiers.forEach((spec) => {
            if (spec.isImportDefaultSpecifier()) {
              const importModule = spec.parent.source.value
              const defineName = spec.node.local.name

              if(translate(opts, importModule)){
                const buildRequire = template(`const IMPORT_NAME = require(SOURCE)`)
                const newNode = buildRequire({
                  IMPORT_NAME: t.identifier(defineName),
                  SOURCE: t.stringLiteral(importModule)
                })
                nodePath.replaceWith(newNode);
              }
            }
          })
        }
      }
    }
  }
}