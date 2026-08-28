/*
  E'lon qilinmagan o'zgaruvchilarni topadi.

  `<script setup>` ichida yo'q nomga murojaat qilinsa (masalan olib tashlangan
  `total`), Vue ham, Vite ham bu haqda hech nima demaydi — xato faqat o'sha
  satr brauzerda ishlaganda "ReferenceError" bo'lib chiqadi. Tugma bosilganda
  esa hech nima bo'lmaydi, chunki hodisa ishlovchisi shu yerda yiqiladi.

  Shu sababli har bir .vue va .js fayl AST ga o'giriladi: e'lon qilingan
  hamma nomlar yig'iladi va ularga kirmaydigan murojaatlar ro'yxatga tushadi.
  Tekshiruv fayl bo'yicha yaxlit (blok darajasidagi ko'lam hisobga olinmaydi) —
  ya'ni ataylab "kamroq shubhalanadi": noto'g'ri ogohlantirish bermaydi.
*/
import fs from 'fs'
import path from 'path'
import { parse } from '@babel/parser'

// brauzer va JS ning o'z nomlari
const GLOBALS = new Set([
  'globalThis', 'window', 'document', 'navigator', 'location', 'history', 'console',
  'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'queueMicrotask',
  'requestAnimationFrame', 'cancelAnimationFrame', 'structuredClone',
  'Promise', 'JSON', 'Math', 'Date', 'Intl', 'RegExp', 'Symbol', 'Proxy', 'Reflect',
  'Number', 'String', 'Boolean', 'Array', 'Object', 'Set', 'Map', 'WeakMap', 'WeakSet',
  'Error', 'TypeError', 'RangeError', 'SyntaxError',
  'isNaN', 'isFinite', 'parseInt', 'parseFloat', 'NaN', 'Infinity', 'undefined',
  'fetch', 'Headers', 'Request', 'Response', 'AbortController', 'FormData',
  'Blob', 'File', 'FileReader', 'URL', 'URLSearchParams', 'WebSocket', 'EventSource',
  'TextEncoder', 'TextDecoder', 'atob', 'btoa', 'crypto', 'performance',
  'localStorage', 'sessionStorage', 'alert', 'confirm', 'prompt',
  'Image', 'Audio', 'MediaRecorder', 'MutationObserver', 'ResizeObserver',
  'IntersectionObserver', 'Event', 'CustomEvent', 'HTMLElement', 'Node',
  'process', 'require', 'module', 'exports', '__dirname', '__filename', 'Buffer',
  'decodeURIComponent', 'encodeURIComponent', 'decodeURI', 'encodeURI', 'escape', 'unescape',
  'Function', 'indexedDB', 'IDBKeyRange', 'ArrayBuffer', 'Uint8Array', 'DataView',
  // Vue kompilyator makroslari — import qilinmaydi
  'defineProps', 'defineEmits', 'defineModel', 'defineExpose', 'defineOptions',
  'defineSlots', 'withDefaults'
])

/* ---------- e'lonlarni yig'ish ---------- */

function declarePattern(node, out) {
  if (!node) return
  switch (node.type) {
    case 'Identifier':
      out.add(node.name); break
    case 'ObjectPattern':
      node.properties.forEach((p) => declarePattern(p.type === 'RestElement' ? p.argument : p.value, out))
      break
    case 'ArrayPattern':
      node.elements.forEach((el) => declarePattern(el, out)); break
    case 'AssignmentPattern':
      declarePattern(node.left, out); break
    case 'RestElement':
      declarePattern(node.argument, out); break
    default: break
  }
}

const isNode = (v) => v && typeof v === 'object' && typeof v.type === 'string'

function walk(node, visit) {
  if (!isNode(node)) return
  visit(node)
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'leadingComments' || key === 'trailingComments') continue
    const value = node[key]
    if (Array.isArray(value)) value.forEach((v) => walk(v, visit))
    else walk(value, visit)
  }
}

function collectDeclared(ast) {
  const out = new Set()

  walk(ast, (n) => {
    switch (n.type) {
      case 'ImportDefaultSpecifier':
      case 'ImportNamespaceSpecifier':
      case 'ImportSpecifier':
        out.add(n.local.name); break
      case 'VariableDeclarator':
        declarePattern(n.id, out); break
      case 'FunctionDeclaration':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
      case 'ClassMethod':
      case 'ObjectMethod':
        if (n.id) out.add(n.id.name)
        n.params.forEach((p) => declarePattern(p, out))
        break
      case 'ClassDeclaration':
      case 'ClassExpression':
        if (n.id) out.add(n.id.name); break
      case 'CatchClause':
        declarePattern(n.param, out); break
      case 'LabeledStatement':
        out.add(n.label.name); break
      default: break
    }
  })

  return out
}

/* ---------- murojaatlarni yig'ish ---------- */

function collectUsed(ast) {
  const used = new Map() // nom -> birinchi uchragan satri

  const skip = new Set()
  walk(ast, (n) => {
    // obj.prop dagi `prop` — murojaat emas
    if ((n.type === 'MemberExpression' || n.type === 'OptionalMemberExpression') && !n.computed) skip.add(n.property)
    // { kalit: qiymat } dagi kalit; qisqartma bo'lsa qiymat bilan bir xil tugun
    if (n.type === 'ObjectProperty' && !n.computed && !n.shorthand) skip.add(n.key)
    if (n.type === 'ObjectMethod' && !n.computed) skip.add(n.key)
    if (n.type === 'ClassMethod' && !n.computed) skip.add(n.key)
    if (n.type === 'ClassProperty' && !n.computed) skip.add(n.key)
    // e'lon qilinayotgan nomlar
    if (n.type === 'VariableDeclarator') skip.add(n.id)
    if (n.type === 'FunctionDeclaration' && n.id) skip.add(n.id)
    if (n.type === 'ImportSpecifier') { skip.add(n.local); skip.add(n.imported) }
    if (n.type === 'ImportDefaultSpecifier' || n.type === 'ImportNamespaceSpecifier') skip.add(n.local)
    if (n.type === 'ExportSpecifier') { skip.add(n.local); skip.add(n.exported) }
    if (n.type === 'MetaProperty') { skip.add(n.meta); skip.add(n.property) }
    if (n.type === 'LabeledStatement') skip.add(n.label)
    if (n.type === 'BreakStatement' || n.type === 'ContinueStatement') skip.add(n.label)
    // funksiya parametrlari va destrukturizatsiya
    if (Array.isArray(n.params)) {
      n.params.forEach((p) => walk(p, (x) => { if (x.type === 'Identifier') skip.add(x) }))
    }
    if (n.type === 'CatchClause' && n.param) walk(n.param, (x) => { if (x.type === 'Identifier') skip.add(x) })
    if (n.type === 'ObjectPattern' || n.type === 'ArrayPattern') {
      walk(n, (x) => { if (x.type === 'Identifier') skip.add(x) })
    }
  })

  walk(ast, (n) => {
    if (n.type !== 'Identifier' || skip.has(n)) return
    if (!used.has(n.name)) used.set(n.name, n.loc?.start.line ?? 0)
  })

  return used
}

/* ---------- fayllar ---------- */

const files = []
const walkDir = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
  const p = path.join(dir, e.name)
  if (e.isDirectory()) walkDir(p)
  else if (/\.(vue|js)$/.test(e.name)) files.push(p.split(path.sep).join('/'))
})
walkDir('src')

const problems = []
let checked = 0

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8')

  // .vue dan <script setup> ajratiladi; satr raqamlari saqlanadi
  let code = raw
  let offset = 0
  if (file.endsWith('.vue')) {
    const m = raw.match(/<script[^>]*>([\s\S]*?)<\/script>/)
    if (!m) continue
    code = m[1]
    offset = raw.slice(0, m.index).split('\n').length
  }

  let ast
  try {
    ast = parse(code, { sourceType: 'module', errorRecovery: true })
  } catch (e) {
    problems.push(`${file}: o'qib bo'lmadi — ${e.message}`)
    continue
  }

  checked += 1
  const declared = collectDeclared(ast)
  const used = collectUsed(ast)

  for (const [name, line] of used) {
    if (declared.has(name) || GLOBALS.has(name)) continue
    problems.push(`${file}:${line + offset} — "${name}" e'lon qilinmagan`)
  }
}

console.log(`ko'lam: ${checked} ta fayl tekshirildi`)
if (problems.length) {
  console.log('XATO:')
  problems.forEach((p) => console.log('  ' + p))
  process.exit(1)
}
console.log("e'lon qilinmagan nom topilmadi")
