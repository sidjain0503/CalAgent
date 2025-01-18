import { FC, memo, ReactNode } from "react";
import ReactMarkdown, { Options } from "react-markdown";

export const MemoizedReactMarkdown = memo(
  ({ children, ...props }) => (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => (
          <h1
            className="font-head text-[32px] font-normal my-4 text-gray-900"
            {...props}
          />
        ),
        h2: ({ node, ...props }) => (
          <h2
            className="font-head text-[28px] font-normal my-4 text-gray-900"
            {...props}
          />
        ),
        h3: ({ node, ...props }) => (
          <h3
            className="font-head text-[24px] font-normal my-4 text-gray-900"
            {...props}
          />
        ),
        h4: ({ node, ...props }) => (
          <h4
            className="font-head text-[20px] font-normal my-4 text-gray-900"
            {...props}
          />
        ),
        h5: ({ node, ...props }) => (
          <h5
            className="font-head text-[16px] font-normal my-4 text-gray-900"
            {...props}
          />
        ),
        h6: ({ node, ...props }) => (
          <h6
            className="font-head text-[14px] font-normal my-4 text-gray-900"
            {...props}
          />
        ),
        strong: ({ node, ...props }) => (
          <strong className="font-medium text-gray-900 my-4" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="font-normal my-1" {...props} />
        ),
        a: ({ node, ...props }) => (
          <a className="text-primary" target="_blank" {...props} />
        ),
        hr: ({ node, ...props }) => <hr className="my-4" {...props} />,
        table: ({ node, ...props }) => (
          <table className="table-auto w-full my-4" {...props} />
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-gray-200" {...props} />
        ),
        tbody: ({ node, ...props }) => <tbody {...props} />,
        tr: ({ node, ...props }) => <tr className="border-b" {...props} />,
        th: ({ node, ...props }) => (
          <th className="px-4 py-2 text-left" {...props} />
        ),
        td: ({ node, ...props }) => <td className="px-4 py-2" {...props} />,
      }}
      {...props}
    >
      {children}
    </ReactMarkdown>
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
