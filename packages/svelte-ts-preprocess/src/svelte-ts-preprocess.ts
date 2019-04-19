import ts from 'typescript'

const LANGS = ['ts', 'typescript']

function importTransformer<T extends ts.Node>(): ts.TransformerFactory<T> {
  return context => {
    const visit: ts.Visitor = node => {
      if (ts.isImportDeclaration(node)) {
        const text = node.moduleSpecifier.getText().slice(0, -1)
        if (text.endsWith('.svelte')) {
          // console.log('------- svelte import -----')
          // console.log(node.getFullText().trim())
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

function isSvelteImport(d: ts.Diagnostic) {
  return d.code == 2307 && typeof d.messageText == 'string' && /\.svelte['"]\.$/.test(d.messageText)
}
function clearDiagnostics(diagnostics: ReadonlyArray<ts.Diagnostic>) {
  return diagnostics.filter(d => !isSvelteImport(d))
}

function getFormatDiagnosticsHost(cwd: string) {
  return {
    getCanonicalFileName: fileName => fileName,
    getCurrentDirectory: () => cwd,
    getNewLine: () => ts.sys.newLine
  } as ts.FormatDiagnosticsHost
}

interface File {
  name: string
  content: string
}

function createProxyHost(host: ts.CompilerHost, file: File) {
  const proxy: ts.CompilerHost = {
    getSourceFile: (
      fileName: string,
      languageVersion: ts.ScriptTarget,
      _onError?: (message: string) => void
    ) => {
      return fileName === file.name
        ? ts.createSourceFile(file.name, file.content, languageVersion)
        : host.getSourceFile(fileName, languageVersion, _onError)
    },
    writeFile: (_fileName, _content) => {
      throw new Error('unsupported')
    },
    getCanonicalFileName: fileName =>
      fileName === file.name
        ? ts.sys.useCaseSensitiveFileNames
          ? fileName
          : fileName.toLowerCase()
        : host.getCanonicalFileName(fileName),

    fileExists: fileName => (fileName === file.name ? true : host.fileExists(fileName)),
    readFile: fileName => (fileName === file.name ? file.content : host.readFile(fileName)),

    getDefaultLibFileName: host.getDefaultLibFileName.bind(host),
    getCurrentDirectory: host.getCurrentDirectory.bind(host),
    getNewLine: host.getNewLine.bind(host),
    useCaseSensitiveFileNames: host.useCaseSensitiveFileNames.bind(host),
    resolveModuleNames: host.resolveModuleNames && host.resolveModuleNames.bind(host),
    getDirectories: host.getDirectories && host.getDirectories.bind(host)
  }
  return proxy
}

interface Script {
  filename: string
  content: string
  attributes: {
    lang?: string
  }
}

function preprocess(options?: ts.CompilerOptions) {
  function script({ content, attributes, filename }: Script) {
    if (!attributes.lang) {
      return
    }

    const lang = attributes.lang.toLowerCase()
    if (!LANGS.includes(lang)) {
      return
    }

    const basePath: string = process.cwd()
    const formatHost = getFormatDiagnosticsHost(basePath)
    const configPath = ts.findConfigFile(basePath, ts.sys.fileExists)
    if (!configPath) {
      throw new Error("Could not find a valid 'tsconfig.json'.")
    }
    // https://github.com/Microsoft/TypeScript/blob/9c71eaf59040ae75343da8cdff01344020f5bba2/tests/cases/compiler/APISample_parseConfig.ts
    // read config
    const result = ts.readConfigFile(configPath, ts.sys.readFile)
    if (result.error) {
      const msg = ts.formatDiagnostics([result.error], formatHost)
      throw new Error(msg)
    }

    // parse config
    const { config, error } = ts.parseConfigFileTextToJson(
      configPath,
      JSON.stringify(result.config)
    )
    if (error) {
      const msg = ts.formatDiagnostics([error], formatHost)
      throw new Error(msg)
    }

    const settings = ts.convertCompilerOptionsFromJson(config.compilerOptions, basePath)
    if (!settings.options) {
      const msg = ts.formatDiagnostics(settings.errors, formatHost)
      throw new Error(msg)
    }

    // override
    const { options } = settings
    options.target = ts.ScriptTarget.ESNext
    options.module = ts.ModuleKind.ESNext
    options.sourceMap = false
    options.declaration = false
    options.alwaysStrict = false

    // options.isolatedModules = true

    // // transpileModule does not write anything to disk so there is no need to verify that there are no conflicts between input and output paths.
    // options.suppressOutputPathCheck = true

    // Filename can be non-ts file.
    options.allowNonTsExtensions = true

    // // We are not returning a sourceFile for lib file when asked by the program,
    // // so pass --noLib to avoid reporting a file not found error.
    // options.noLib = true

    // // Clear out other settings that would not be used in transpiling this module
    // options.lib = undefined
    // options.types = undefined
    // options.noEmit = undefined
    // options.noEmitOnError = undefined
    // options.paths = undefined
    // options.rootDirs = undefined
    // options.declaration = undefined
    // options.composite = undefined
    // options.declarationDir = undefined
    // options.out = undefined
    // options.outFile = undefined

    // // We are not doing a full typecheck, we are not resolving the whole context,
    // // so pass --noResolve to avoid reporting missing file errors.
    // options.noResolve = true

    const rootFiles = [filename]
    const proxyHost = createProxyHost(ts.createCompilerHost(options), {
      name: filename,
      content
    })

    let code = ''
    const writeFile: ts.WriteFileCallback = (fileName, data) => {
      // console.log(fileName)
      // console.log(data)
      if (fileName.endsWith('.js')) {
        code = data
      }
    }

    const customTransformers: ts.CustomTransformers = {
      before: [importTransformer()]
    }

    const program = ts.createProgram(rootFiles, options, proxyHost)
    program.emit(undefined, writeFile, undefined, undefined, customTransformers)

    const diagnostics = clearDiagnostics(ts.getPreEmitDiagnostics(program))
    if (diagnostics.length) {
      const s = ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost)
      console.log(s)
    }

    return { code }
  }
  return { script }
}

export default preprocess
