"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="ai-output">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="ai-h1">{children}</h1>,
          h2: ({ children }) => <h2 className="ai-h2">{children}</h2>,
          h3: ({ children }) => <h3 className="ai-h3">{children}</h3>,
          p: ({ children }) => <p className="ai-p">{children}</p>,
          strong: ({ children }) => <strong className="ai-strong">{children}</strong>,
          em: ({ children }) => <em className="ai-em">{children}</em>,
          ul: ({ children }) => <ul className="ai-ul">{children}</ul>,
          ol: ({ children }) => <ol className="ai-ol">{children}</ol>,
          li: ({ children }) => <li className="ai-li">{children}</li>,
          blockquote: ({ children }) => <blockquote className="ai-quote">{children}</blockquote>,
          hr: () => <hr className="ai-hr" />,
          a: ({ href, children }) => (
            <a className="ai-link" href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <pre className="ai-code-block">
                  <code {...props}>{children}</code>
                </pre>
              );
            }
            return (
              <code className="ai-code-inline" {...props}>
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="ai-table-wrap">
              <table className="ai-table">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="ai-th">{children}</th>,
          td: ({ children }) => <td className="ai-td">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
