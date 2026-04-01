import React from 'react'

type LexicalNode = {
  type: string
  text?: string
  format?: number
  tag?: string
  listType?: 'bullet' | 'number'
  url?: string
  children?: LexicalNode[]
  version?: number
}

type LexicalRoot = {
  root: {
    children: LexicalNode[]
  }
}

function renderNode(node: LexicalNode, index: number): React.ReactNode {
  switch (node.type) {
    case 'text': {
      let content: React.ReactNode = node.text
      const fmt = node.format ?? 0
      if (fmt & 1) content = <strong key={index}>{content}</strong>
      if (fmt & 2) content = <em key={index}>{content}</em>
      if (fmt & 8) content = <u key={index}>{content}</u>
      if (fmt & 16) content = <code key={index} className="font-mono text-neon bg-surface px-1">{content}</code>
      return content
    }
    case 'paragraph':
      return (
        <p key={index} className="mb-4 last:mb-0">
          {node.children?.map(renderNode)}
        </p>
      )
    case 'heading': {
      const tag = node.tag ?? 'h2'
      const sizeMap: Record<string, string> = {
        h1: 'text-3xl font-bold mb-6',
        h2: 'text-2xl font-bold mb-4',
        h3: 'text-xl font-semibold mb-3',
        h4: 'text-lg font-semibold mb-2',
      }
      return React.createElement(
        tag,
        { key: index, className: sizeMap[tag] ?? 'text-xl font-bold mb-3' },
        node.children?.map(renderNode),
      )
    }
    case 'list': {
      const Tag = node.listType === 'number' ? 'ol' : 'ul'
      const listClass =
        node.listType === 'number'
          ? 'list-decimal list-inside mb-4 space-y-1'
          : 'list-disc list-inside mb-4 space-y-1'
      return (
        <Tag key={index} className={listClass}>
          {node.children?.map(renderNode)}
        </Tag>
      )
    }
    case 'listitem':
      return (
        <li key={index} className="text-[#AAAAAA]">
          {node.children?.map(renderNode)}
        </li>
      )
    case 'link':
      return (
        <a
          key={index}
          href={node.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neon underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          {node.children?.map(renderNode)}
        </a>
      )
    case 'quote':
      return (
        <blockquote
          key={index}
          className="border-l-2 border-neon pl-4 my-6 text-[#888888] italic"
        >
          {node.children?.map(renderNode)}
        </blockquote>
      )
    default:
      if (node.children) {
        return <React.Fragment key={index}>{node.children.map(renderNode)}</React.Fragment>
      }
      return null
  }
}

export function LexicalContent({
  content,
  className,
}: {
  content: LexicalRoot | null | undefined
  className?: string
}) {
  if (!content?.root?.children) return null
  return (
    <div className={className}>
      {content.root.children.map(renderNode)}
    </div>
  )
}
