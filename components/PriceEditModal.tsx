
import React, { useState, useEffect } from 'react';
import type { CartItem } from '../types';

interface PriceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemId: string, newPrice: number) => void;
  item: CartItem | null;
}

export const PriceEditModal: React.FC<PriceEditModalProps> = ({ isOpen, onClose, onSave, item }) => {
  const [newPrice, setNewPrice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setNewPrice(item.finalPrice.toFixed(2));
      setError('');
    }
  }, [item]);

  if (!isOpen || !item) return null;
  
  const threshold = typeof item.thresholdPrice === 'number' ? item.thresholdPrice : item.cost;

  const handleSave = () => {
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum)) {
      setError('Invalid price. Please enter a number.');
      return;
    }
    if (priceNum < threshold) {
      setError(`Price cannot be below the threshold of PKR ${threshold.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}.`);
      return;
    }
    onSave(item.id, priceNum);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleSave();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Edit Price</h2>
        <p className="mb-2">Editing price for: <span className="font-semibold">{item.name}</span></p>
        <p className="text-sm text-gray-400 mb-4">Minimum allowed price: <span className="font-semibold">PKR {threshold.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></p>
        
        {error && <p className="text-red-400 bg-red-900/30 p-3 rounded-md mb-4 text-center">{error}</p>}

        <div>
            <label htmlFor="newPriceInput" className="block text-sm font-medium text-gray-300 mb-2">New Price (PKR)</label>
            <input 
                id="newPriceInput"
                type="number"
                step="0.01"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-3 bg-gray-900 rounded-lg border-2 border-gray-600 focus:border-cyan-500"
                autoFocus
            />
        </div>
        
        <div className="flex gap-4 mt-8">
          <button onClick={onClose} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded">
            Cancel
          </button>
          <button onClick={handleSave} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded">
            Save Price
          </button>
        </div>
      </div>
    </div>
  );
};