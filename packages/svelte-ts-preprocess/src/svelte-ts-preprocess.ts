import ts from 'typescript'

const LANGS = ['ts', 'typescript']

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
    getDefaultLibFileName: () => '',
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

    settings.options.target = ts.ScriptTarget.ESNext
    settings.options.sourceMap = false
    settings.options.declaration = false
    settings.options.alwaysStrict = false

    const rootFiles = [filename]
    const proxyHost = createProxyHost(ts.createCompilerHost(settings.options), {
      name: filename,
      content
    })

    let code = ''
    const writeFile: ts.WriteFileCallback = (fileName, data) => {
      console.log(fileName)
      console.log(data)
      if (fileName.endsWith('.js')) {
        code = data
      }
    }

    const customTransformers: ts.CustomTransformers = {
      before: [importTransformer()]
    }

    const program = ts.createProgram(rootFiles, settings.options, proxyHost)
    program.emit(
      proxyHost.getSourceFile(filename, ts.ScriptTarget.ESNext),
      writeFile,
      undefined,
      undefined,
      customTransformers
    )

    return { code }
  }
  return { script }
}

export default preprocess
