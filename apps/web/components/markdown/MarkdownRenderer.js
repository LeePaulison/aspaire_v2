import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { CodeBlock } from "./CodeBlock";

export const MarkdownRenderer = ({ content }) => {
  return (
    <div className="message-markdown">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre({ children }) {
            const code = Array.isArray(children) ? children[0] : children;

            return (
              <CodeBlock
                className={code?.props?.className}
                language={code?.props?.className?.replace(/^language-/, "")}
              >
                {code?.props?.children}
              </CodeBlock>
            );
          },
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};
