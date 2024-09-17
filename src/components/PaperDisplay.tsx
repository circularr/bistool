import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { paperContent } from '../data/paperContent';

interface PaperDisplayProps {
  displayMode: 'paper' | 'magazine' | 'eli5';
}

const PaperDisplay: React.FC<PaperDisplayProps> = ({ displayMode }) => {
  const renderContent = (markdown: string) => (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        inlineMath: ({ value }) => <InlineMath math={value} />,
        math: ({ value }) => <BlockMath math={value} />,
        h1: ({ children }) => <h1 className="text-3xl font-bold mb-6 text-center">{children}</h1>,
        h2: ({ children }) => <h2 className="text-2xl font-semibold mt-8 mb-4">{children}</h2>,
        h3: ({ children }) => <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>,
        p: ({ children }) => <p className="mb-4 text-justify leading-7">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
        li: ({ children }) => <li className="mb-2">{children}</li>,
        blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">{children}</blockquote>,
      }}
    >
      {markdown}
    </ReactMarkdown>
  );

  const renderPaper = () => (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Free Trial vs Freemium: An Economic Analysis</h1>
        <p className="text-sm text-gray-600">
          Claude (Anthropic), Omni (OpenAI), Paul Harwood, Perplexity
        </p>
      </div>
      <div className="border-t border-b border-gray-300 py-4 mb-8">
        <h2 className="text-xl font-semibold mb-2">Abstract</h2>
        <p className="text-justify">{paperContent.paper.split('## Abstract')[1].split('##')[0].trim()}</p>
      </div>
      {renderContent(paperContent.paper.split('## References')[0])}
    </div>
  );

  const renderMagazine = () => (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-800">Navigating Monetization: Free Trial vs. Freemium Models in the Digital Age</h1>
      <div className="mb-8 bg-gray-100 p-4 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Key Takeaways</h3>
        <ul className="list-disc pl-6">
          <li>Free Trial offers immediate value demonstration</li>
          <li>Freemium builds a wider user base</li>
          <li>Consider CAC, CLV, and market dynamics when choosing</li>
        </ul>
      </div>
      <div className="flex justify-center space-x-8 mb-8">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <p className="text-sm">Free Trial</p>
        </div>
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          <p className="text-sm">Freemium</p>
        </div>
      </div>
      <div className="text-lg leading-relaxed">
        {renderContent(paperContent.magazine)}
      </div>
    </div>
  );

  const renderEli5 = () => (
    <div className="max-w-4xl mx-auto">
      {renderContent(paperContent.eli5)}
    </div>
  );

  return (
    <div className="p-4">
      {displayMode === 'paper' && renderPaper()}
      {displayMode === 'magazine' && renderMagazine()}
      {displayMode === 'eli5' && renderEli5()}
    </div>
  );
};

export default PaperDisplay;