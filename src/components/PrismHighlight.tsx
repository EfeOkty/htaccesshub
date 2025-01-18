import { useEffect } from 'react'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'

// Apache syntax için özel tanımlama
Prism.languages.apache = {
  'comment': /#.*/,
  'directive': {
    pattern: /\b[a-z]\w*(?=\s)/i,
    alias: 'keyword'
  },
  'variable': /%\{[^}]+\}/,
  'operator': /[!=<>]=?/,
  'string': {
    pattern: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/,
    inside: {
      'variable': /%\{[^}]+\}/
    }
  }
}

interface PrismHighlightProps {
  code: string
}

export default function PrismHighlight({ code }: PrismHighlightProps) {
  useEffect(() => {
    Prism.highlightAll()
  }, [code])

  return (
    <pre className="!bg-gray-900 !p-4 rounded-lg overflow-x-auto">
      <code className="language-apache">
        {code}
      </code>
    </pre>
  )
} 