
import React, { useState, useMemo } from 'react';
import type { Product } from '../types';

interface CatalogProps {
  products: Product[];
}

interface CategoryStructure {
  [category: string]: {
    [subcategory: string]: Product[];
  };
}

export const Catalog: React.FC<CatalogProps> = ({ products }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  const categories = useMemo<CategoryStructure>(() => {
    return products.reduce((acc, product) => {
      const { category, subcategory = 'General' } = product;
      if (!acc[category]) {
        acc[category] = {};
      }
      if (!acc[category][subcategory]) {
        acc[category][subcategory] = [];
      }
      acc[category][subcategory].push(product);
      return acc;
    }, {} as CategoryStructure);
  }, [products]);

  const handleCategorySelect = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null); // Toggle collapse
      setSelectedSubCategory(null);
    } else {
      setSelectedCategory(category);
      // Select the first subcategory by default when expanding
      setSelectedSubCategory(Object.keys(categories[category])[0]);
    }
  };
  
  const handleSubCategorySelect = (subcategory: string) => {
    setSelectedSubCategory(subcategory);
  };
  
  const displayedProducts = useMemo(() => {
    if (selectedCategory && selectedSubCategory) {
        return categories[selectedCategory]?.[selectedSubCategory] || [];
    }
    return [];
  }, [categories, selectedCategory, selectedSubCategory]);

  const categoryList = Object.keys(categories).sort();

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Category Sidebar */}
      <aside className="w-1/4 bg-gray-800 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Product Categories</h2>
        <ul className="space-y-1">
          {categoryList.map(category => (
            <li key={category}>
              <button 
                onClick={() => handleCategorySelect(category)}
                className={`w-full text-left p-3 rounded-md font-semibold transition-colors flex justify-between items-center ${selectedCategory === category ? 'bg-cyan-600 text-white' : 'hover:bg-gray-700'}`}
              >
                {category}
                <svg className={`w-5 h-5 transition-transform ${selectedCategory === category ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
              {selectedCategory === category && (
                <ul className="pl-4 mt-1 space-y-1">
                  {Object.keys(categories[category]).sort().map(subcategory => (
                    <li key={subcategory}>
                      <button 
                        onClick={() => handleSubCategorySelect(subcategory)}
                        className={`w-full text-left p-2 rounded-md text-sm transition-colors ${selectedSubCategory === subcategory ? 'bg-gray-700 text-cyan-300' : 'hover:bg-gray-700/50'}`}
                      >
                        {subcategory}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="w-3/4 flex flex-col">
        {displayedProducts.length > 0 ? (
          <div className="flex-grow p-6 overflow-y-auto">
              <h3 className="text-2xl font-bold mb-4">{selectedCategory} &gt; {selectedSubCategory}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayedProducts.map(product => (
                      <div key={product.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
                          <img
                              src={product.imageUrl || 'https://via.placeholder.com/300x200/374151/FFFFFF?text=No+Image'}
                              alt={product.name}
                              className="w-full h-48 object-cover"
                          />
                          <div className="p-4 flex flex-col flex-grow">
                              <h3 className="text-lg font-bold">{product.name}</h3>
                              <p className="text-gray-400 text-sm mb-4">ID: {product.id}</p>
                              <div className="mt-auto flex justify-between items-center">
                                  <p className="text-xl font-semibold text-cyan-400">PKR {product.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                  <p className="text-gray-300">Stock: <span className="font-bold">{product.stock}</span></p>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
        ) : (
            <div className="flex-grow flex items-center justify-center">
                <p className="text-2xl text-gray-500">
                  {selectedCategory ? 'Select a subcategory' : 'Select a category to view products.'}
                </p>
            </div>
        )}
      </main>
    </div>
  );
};
