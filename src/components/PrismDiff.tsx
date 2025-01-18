import Prism from 'prismjs'
import { useEffect } from 'react'

interface PrismDiffProps {
  originalCode: string;
  newCode: string;
}

interface DiffLine {
  content: string;
  type: 'added' | 'removed' | 'unchanged';
  lineNumber: number;
}

function computeDiff(originalCode: string, newCode: string): { original: DiffLine[], new: DiffLine[] } {
  const originalLines = originalCode.split('\n')
  const newLines = newCode.split('\n')
  
  const original: DiffLine[] = []
  const newDiff: DiffLine[] = []
  
  let i = 0
  let j = 0
  
  while (i < originalLines.length || j < newLines.length) {
    if (i < originalLines.length && j < newLines.length && originalLines[i] === newLines[j]) {
      // Satır değişmemiş
      original.push({ content: originalLines[i], type: 'unchanged', lineNumber: i + 1 })
      newDiff.push({ content: newLines[j], type: 'unchanged', lineNumber: j + 1 })
      i++
      j++
    } else {
      // Değişiklik var - önceki ve sonraki 2 satırı da kontrol et
      let found = false
      for (let lookAhead = 1; lookAhead <= 2 && !found; lookAhead++) {
        if (i + lookAhead < originalLines.length && 
            j < newLines.length && 
            originalLines[i + lookAhead] === newLines[j]) {
          // Orijinal kodda satır silinmiş
          for (let k = 0; k < lookAhead; k++) {
            original.push({ content: originalLines[i + k], type: 'removed', lineNumber: i + k + 1 })
          }
          i += lookAhead
          found = true
        } else if (i < originalLines.length && 
                  j + lookAhead < newLines.length && 
                  originalLines[i] === newLines[j + lookAhead]) {
          // Yeni satır eklenmiş
          for (let k = 0; k < lookAhead; k++) {
            newDiff.push({ content: newLines[j + k], type: 'added', lineNumber: j + k + 1 })
          }
          j += lookAhead
          found = true
        }
      }
      
      if (!found) {
        // Satır değiştirilmiş
        if (i < originalLines.length) {
          original.push({ content: originalLines[i], type: 'removed', lineNumber: i + 1 })
          i++
        }
        if (j < newLines.length) {
          newDiff.push({ content: newLines[j], type: 'added', lineNumber: j + 1 })
          j++
        }
      }
    }
  }
  
  return { original, new: newDiff }
}

export default function PrismDiff({ originalCode, newCode }: PrismDiffProps) {
  useEffect(() => {
    Prism.highlightAll()
  }, [originalCode, newCode])

  const diff = computeDiff(originalCode, newCode)

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gray-900 rounded-lg p-4">
        <h3 className="text-red-400 font-semibold mb-2">Orijinal Kod:</h3>
        <pre className="overflow-x-auto relative">
          {diff.original.map((line, index) => (
            <div 
              key={index} 
              className={`flex ${line.type === 'removed' ? 'bg-red-900/30 text-red-300' : ''} -mx-4 px-4`}
            >
              <span className="w-8 text-gray-500 select-none">{line.lineNumber}</span>
              <code className="language-apache flex-1">{line.content}</code>
              {line.type === 'removed' && (
                <span className="text-red-500 ml-2">-</span>
              )}
            </div>
          ))}
        </pre>
      </div>
      <div className="bg-gray-900 rounded-lg p-4">
        <h3 className="text-green-400 font-semibold mb-2">Düzeltilmiş Kod:</h3>
        <pre className="overflow-x-auto relative">
          {diff.new.map((line, index) => (
            <div 
              key={index} 
              className={`flex ${line.type === 'added' ? 'bg-green-900/30 text-green-300' : ''} -mx-4 px-4`}
            >
              <span className="w-8 text-gray-500 select-none">{line.lineNumber}</span>
              <code className="language-apache flex-1">{line.content}</code>
              {line.type === 'added' && (
                <span className="text-green-500 ml-2">+</span>
              )}
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
} 