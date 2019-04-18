import ts from 'typescript'

function importTransformer<T extends ts.Node>(): ts.TransformerFactory<T> {
  return context => {
    const visit: ts.Visitor = node => {
      if (ts.isImportDeclaration(node)) {
        const text = node.moduleSpecifier.getText().slice(0, -1)
        if (text.endsWith('.svelte')) {
          console.log('------- svelte import -----')
          console.log(node.getFullText().trim())
          return ts.createImportDeclaration(
            node.decorators,
            node.modifiers,
            node.importClause,
            node.moduleSpecifier
          )
        }
      }
      return ts.visitEachChild(node, child => visit(child), context)
    }

    return node => ts.visitNode(node, visit)
  }
}
