import React, { useState } from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [notified, setNotified] = useState(false);

  const handleAction = () => {
    if (product.inStock) {
        // In real app, go to details page
        console.log("Navigating to", product.id);
    } else {
        // Mock Notify Logic
        setNotified(true);
        setTimeout(() => setNotified(false), 3000);
    }
  };

  return (
    <div className="flex-shrink-0 w-64 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group relative">
      
      {/* Toast Notification */}
      {notified && (
          <div className="absolute inset-0 z-10 bg-white/90 flex flex-col items-center justify-center p-4 text-center animate-fade-in">
              <div className="text-green-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-800">Alert Set!</p>
              <p className="text-xs text-slate-500">We'll notify you when this is back.</p>
          </div>
      )}

      <div className="h-40 overflow-hidden relative bg-gray-50 p-4">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
        />
        {!product.inStock && (
           <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
             Out of Stock
           </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
           <h3 className="font-semibold text-slate-800 line-clamp-1 text-base group-hover:text-blue-600 transition-colors" title={product.name}>{product.name}</h3>
           <span className="font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">${product.price}</span>
        </div>
        <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">{product.description}</p>
        <div className="mt-auto">
             <div className="flex items-center space-x-1 mb-3">
               <div className="flex text-yellow-400 text-xs">
                 {'★'.repeat(Math.round(product.rating))}
                 <span className="text-slate-200">{'★'.repeat(5 - Math.round(product.rating))}</span>
               </div>
               <span className="text-xs text-slate-400 mx-1">•</span>
               <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium bg-slate-100 px-1.5 py-0.5 rounded">{product.category}</span>
             </div>
            <button 
                onClick={handleAction}
                className={`w-full py-2.5 text-sm rounded-lg font-semibold transition-all duration-200 shadow-sm ${
                product.inStock 
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200 hover:shadow-md' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}>
                {product.inStock ? 'View Details' : (notified ? 'Notified ✓' : 'Notify Me')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;