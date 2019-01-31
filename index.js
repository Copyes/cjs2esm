#!/usr/bin/env node
const recast = require('recast')
const path = require('path')
const fs = require('fs')
const {
  identifier: id,
  expressionStatement,
  memberExpression,
  assignmentExpression,
  variableDeclaration,
  variableDeclarator,
  callExpression,
  literal
} = recast.types.builders
// 获取参数
const args = process.argv.slice(2)
//如果没有参数，或提供了-h 或--help选项，则打印帮助
if(args.length===0 || args.includes('-h') || args.includes('--help')){
  console.log(`
    采用commonjs规则，将.js文件内所有函数修改为导出形式。
 
    选项： -r  或 --rewrite 可直接覆盖原有文件
    `)
  process.exit(0)
}

// 只要有-r 或--rewrite参数，则rewriteMode为true
let rewriteMode = args.includes('-r') || args.includes('--rewrite')
 
// 获取文件名
const clearFileArg = args.filter((item)=>{
  return !['-r','--rewrite','-h','--help'].includes(item)
})
 
// 只处理一个文件
let filename = clearFileArg[0]
 
const writeASTFile = function(ast, filename, rewriteMode){
  const newCode = recast.print(ast).code
  if(!rewriteMode){
    // 非覆盖模式下，将新文件写入*.export.js下
    filename = filename.split('.').slice(0,-1).concat(['export','js']).join('.')
  }
  // 将新代码写入文件
  fs.writeFileSync(path.join(process.cwd(),filename),newCode)
}

recast.run(function (ast, printSource) {
  recast.types.visit(ast, {
    visitImportDeclaration(path) {
      let { specifiers, source} = path.value
      console.log(specifiers[0].local.name)
      console.log(source.value)
      printSource(
        variableDeclaration("const", [
          variableDeclarator(id(specifiers[0].local.name), callExpression(id('require'),literal(source.value)))
        ])
      );
      // printSource(
      //   expressionStatement(
      //     assignmentExpression('=',memberExpression(id('exports'),id('add')),
      //     memberExpression(id('require'),id('add'))
      // )))
      // funcIds.push(funcName.name)
      // const rep = expressionStatement(assignmentExpression('=', memberExpression(id('exports'), funcName),
      //   arrowFunctionExpression(params, body)))
      // path.replace(rep)
      return false
    }
  })
 
 
  // recast.types.visit(ast, {
  //   visitCallExpression(path){
  //     // const node = path.node;
  //     console.log(path)
  //     // if (funcIds.includes(node.callee.name)) {
  //     //   node.callee = memberExpression(id('exports'), node.callee)
  //     // }
  //     return false
  //   }
  // })
 
  // writeASTFile(ast,filename,rewriteMode)
})