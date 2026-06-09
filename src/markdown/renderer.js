// src/markdown/renderer.js
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'
import katex from 'katex'
import texmath from 'markdown-it-texmath'
import 'katex/dist/katex.min.css'

// ---------- 1. 创建 markdown-it 实例 ----------
const md = new MarkdownIt({
  html: false,          // 禁用 HTML 标签，防止 XSS
  linkify: true,        // 自动将 URL 转为链接
  breaks: true,         // 将 \n 转为 <br>，解决换行问题
  typographer: true,    // 美化引号、破折号等
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {}
    }
    return '' // 使用默认转义
  }
})

// 安装数学公式插件（支持 $...$ 和 $$...$$）
md.use(texmath, {
  engine: katex,
  delimiters: ['dollars', 'brackets'],   // 支持 $...$ 和 $$...$$
  katexOptions: { throwOnError: false }
})

// ---------- 2. DOMPurify 安全白名单 ----------
const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
  'strong', 'em', 'del', 's', 'u', 'sup', 'sub',
  'a', 'img',
  'ul', 'ol', 'li',
  'blockquote',
  'code', 'pre',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span', 'details', 'summary'
]

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'class', 'target', 'rel',
  'id', 'name', 'lang',
  // KaTeX 可能需要的一些属性
  'aria-hidden', 'style'
]

// 放行 KaTeX 及相关插件的 class 前缀
const ALLOWED_CLASSES = [
  'katex', 'katex-display', 'katex-html', 'katex-error',
  'math', 'math-inline', 'math-display',
  'sr-only', 'strut', 'delimsizing', 'delimcenter',
  'accent-body', 'base', 'vlist', 'mord', 'mbin', 'mopen', 'mclose', 'mpunct',
  'mtable', 'col-align-l', 'col-align-c', 'col-align-r',
  'msupsub', 'mfrac', 'msqrt', 'mover', 'munderover',
  // 保留之前可能用到的类
  'username-admin', 'username-moderator'
]

// 自定义白名单校验函数
DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  // 所有链接新窗口打开
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

// ---------- 3. 导出渲染函数 ----------
/**
 * 将 Markdown 文本渲染为安全的 HTML（支持 LaTeX 公式）
 * @param {string} markdownText - 原始 Markdown 文本
 * @returns {string} 安全的 HTML 字符串
 */
export function renderMarkdown(markdownText) {
  if (!markdownText) return ''

  // 1. Markdown → HTML (此时公式已被 texmath 转为带 class 的 span)
  const rawHTML = md.render(markdownText)

  // 2. DOMPurify 净化，允许数学相关标签/类
  const cleanHTML = DOMPurify.sanitize(rawHTML, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_CLASSES: ALLOWED_CLASSES  // 注意：DOMPurify 接受 ALLOWED_CLASSES 字段
  })

  return cleanHTML
}