
import React from 'react';
import { Message, Sender } from '../types';
import ProductCard from './ProductCard';
import { LogoIcon } from './Logo';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.sender === Sender.BOT;

  const renderFormattedText = (text: string) => {
    const blocks = text.split(/\n\n+/);
    
    return blocks.map((block, bIdx) => {
      const lines = block.split('\n');
      
      if (lines.some(l => l.trim().startsWith('|') && l.includes('|'))) {
        const tableRows = lines
          .filter(l => l.trim().startsWith('|'))
          .map(l => l.split('|')
            .map(c => c.trim())
            .filter((c, i, a) => !( (i===0 || i===a.length-1) && c==="" ))
          );
        return renderTable(tableRows, `table-${bIdx}`);
      }

      return (
        <div key={bIdx} className="mb-6 last:mb-0 leading-relaxed text-slate-700 text-base">
          {lines.map((line, lIdx) => (
            <React.Fragment key={lIdx}>
              {renderInlineMarkdown(line)}
              {lIdx < lines.length - 1 && <div className="h-1" />}
            </React.Fragment>
          ))}
        </div>
      );
    });
  };

  const renderTable = (rows: string[][], key: string) => {
    const dataRows = rows.filter(r => !r.every(cell => cell.match(/^-+$/)));
    if (dataRows.length < 2) return null;

    return (
      <div key={key} className="my-8 overflow-hidden border border-slate-200 rounded-3xl shadow-sm bg-white/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 border-b border-slate-200">
                {dataRows[0].map((header, idx) => (
                  <th key={idx} className="px-6 py-5 font-black text-slate-800 uppercase text-[9px] tracking-[0.2em]">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataRows.slice(1).map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-blue-50/50 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-6 py-5 text-slate-600 font-medium">
                      {renderInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderInlineMarkdown = (text: string) => {
    let parts: (string | React.ReactNode)[] = [text];

    parts = parts.flatMap(p => {
      if (typeof p !== 'string') return p;
      const regex = /(\*\*.*?\*\*)/g;
      return p.split(regex).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    });

    parts = parts.map(p => {
      if (typeof p === 'string' && (p.trim().startsWith('- ') || p.trim().startsWith('* '))) {
        return (
          <div key="bullet" className="flex items-start my-1.5">
            <span className="mr-3 text-[#5dbcd2] text-lg leading-none">•</span>
            <span className="flex-1">{p.trim().slice(2)}</span>
          </div>
        );
      }
      return p;
    });

    return parts;
  };

  return (
    <div className={`flex w-full mb-12 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-full md:max-w-[92%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        
        <div className={`flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm border ${
            isBot ? 'bg-white border-slate-100 mr-5' : 'bg-slate-900 border-slate-800 text-white ml-5'
        }`}>
            {isBot ? <LogoIcon className="w-8 h-8" /> : <span className="text-[10px] font-black">USER</span>}
        </div>

        <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} w-full`}>
          <div className={`px-8 py-7 rounded-[2.5rem] shadow-sm transition-all ${
              isBot 
                ? 'bg-white border border-slate-100 text-slate-800 rounded-tl-none' 
                : 'bg-[#5dbcd2] text-white rounded-tr-none shadow-blue-100 shadow-xl'
          }`}>
            {renderFormattedText(message.text)}
          </div>

          {message.relatedProducts && message.relatedProducts.length > 0 && (
            <div className="mt-10 w-full overflow-x-auto pb-6 -mx-2 px-2 no-scrollbar">
              <div className="flex gap-6">
                {message.relatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
          
          <span className="text-[9px] text-slate-400 mt-3 px-2 font-black uppercase tracking-[0.2em] opacity-50">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
