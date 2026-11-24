import React from 'react';
import Markdoc, { Node, RenderableTreeNode, Config } from '@markdoc/markdoc';
import { sanitizeHref } from '@/lib/sanitize';

export { sanitizeHref };

interface DocumentRendererProps {
  node: unknown;
  className?: string;
}

const markdocConfig: Config = {
  nodes: {
    list: {
      render: 'CustomList',
      attributes: {
        ordered: { type: Boolean },
      },
      transform(node, config) {
        return new Markdoc.Tag(
          'CustomList',
          { ordered: node.attributes.ordered },
          node.transformChildren(config)
        );
      },
    },
    item: {
      render: 'CustomItem',
      transform(node, config) {
        return new Markdoc.Tag('CustomItem', {}, node.transformChildren(config));
      },
    },
    heading: {
      render: 'CustomHeading',
      attributes: {
        level: { type: Number },
      },
      transform(node, config) {
        return new Markdoc.Tag(
          'CustomHeading',
          { level: node.attributes.level },
          node.transformChildren(config)
        );
      },
    },
    link: {
      render: 'CustomLink',
      attributes: {
        href: { type: String },
      },
      transform(node, config) {
        return new Markdoc.Tag(
          'CustomLink',
          { href: node.attributes.href },
          node.transformChildren(config)
        );
      },
    },
    paragraph: {
      render: 'CustomParagraph',
      transform(node, config) {
        return new Markdoc.Tag('CustomParagraph', {}, node.transformChildren(config));
      },
    },
    fence: {
      render: 'CustomCodeBlock',
      attributes: {
        language: { type: String },
        content: { type: String },
      },
      transform(node) {
        return new Markdoc.Tag('CustomCodeBlock', {
          language: node.attributes.language,
          content: node.attributes.content,
        });
      },
    },
  },
};

const CustomList = ({ ordered, children }: { ordered?: boolean; children?: React.ReactNode }) => {
  return ordered ? (
    <ol className="list-decimal list-outside ml-5 space-y-1.5 my-3 text-muted-foreground">
      {children}
    </ol>
  ) : (
    <ul className="list-disc list-outside ml-5 space-y-1.5 my-3 text-muted-foreground marker:text-primary/70">
      {children}
    </ul>
  );
};

const CustomItem = ({ children }: { children?: React.ReactNode }) => {
  return <li className="leading-relaxed pl-1">{children}</li>;
};

const CustomHeading = ({ level, children }: { level: number; children?: React.ReactNode }) => {
  if (level === 1) return <h1 className="text-xl font-semibold tracking-tight text-foreground mt-7 mb-3">{children}</h1>;
  if (level === 2) return <h2 className="text-lg font-semibold tracking-tight text-foreground mt-6 mb-2.5">{children}</h2>;
  return <h3 className="text-sm font-semibold tracking-tight text-foreground font-mono uppercase mt-5 mb-2">{children}</h3>;
};

const CustomLink = ({ href, children }: { href?: string; children?: React.ReactNode }) => {
  const safeHref = sanitizeHref(href);
  if (!safeHref) {
    return <span className="text-muted-foreground">{children}</span>;
  }

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:text-primary/80 underline underline-offset-4 font-medium transition-colors"
    >
      {children}
    </a>
  );
};

const CustomParagraph = ({ children }: { children?: React.ReactNode }) => {
  return <p className="leading-relaxed text-muted-foreground my-2.5">{children}</p>;
};

const CustomCodeBlock = ({ content, language }: { content: string; language?: string }) => {
  return (
    <div className="my-4 rounded-md border border-border/80 bg-muted/60 p-3 font-mono text-xs overflow-x-auto">
      {language && (
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">
          {language}
        </div>
      )}
      <pre className="text-foreground">
        <code>{content}</code>
      </pre>
    </div>
  );
};

export function DocumentRenderer({ node, className = '' }: DocumentRendererProps) {
  if (!node) return null;

  const transformed: RenderableTreeNode = Markdoc.transform(node as Node, markdocConfig);

  return (
    <div className={`prose max-w-none text-muted-foreground leading-relaxed ${className}`}>
      {Markdoc.renderers.react(transformed, React, {
        components: {
          CustomList,
          CustomItem,
          CustomHeading,
          CustomLink,
          CustomParagraph,
          CustomCodeBlock,
        },
      })}
    </div>
  );
}
