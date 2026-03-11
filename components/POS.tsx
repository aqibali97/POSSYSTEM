import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Product, CartItem, Sale, ShopSettings } from '../types';
import { BillModal } from './BillModal';
import { PriceEditModal } from './PriceEditModal';

interface POSProps {
  products: Product[];
  addSale: (sale: Sale) => void;
  updateStock: (productId: string, quantity: number) => void;
  setNotification: (message: string | null) => void;
  shopSettings: ShopSettings;
}

export const POS: React.FC<POSProps> = ({ products, addSale, updateStock, setNotification, shopSettings }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcode, setBarcode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [saleToConfirm, setSaleToConfirm] = useState<Sale | null>(null);
  const [discountInput, setDiscountInput] = useState('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const scanTimeoutRef = useRef<number | null>(null);
  const [editingPriceItem, setEditingPriceItem] = useState<CartItem | null>(null);


  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);
  
  const addProductToCart = (product: Product) => {
    const itemInCart = cart.find(item => item.id === product.id);
    if (product.stock <= (itemInCart?.quantity ?? 0)) {
        setNotification('Error: Not enough stock!');
        return;
    }
    setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === product.id);
        if (existingItem) {
            return prevCart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        }
        return [...prevCart, { ...product, quantity: 1, finalPrice: product.price }];
    });
  };

  const processBarcode = (scannedCode: string) => {
    if (!scannedCode) return;
    const product = products.find(p => p.id === scannedCode);
    if (product) {
        addProductToCart(product);
    } else {
      setNotification('Error: Product not found!');
    }
    setBarcode(''); // Clear input for next scan
  };
  
  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBarcode = e.target.value;
    setBarcode(newBarcode);

    if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
    }

    scanTimeoutRef.current = window.setTimeout(() => {
        processBarcode(newBarcode);
    }, 50); // 50ms delay to ensure the entire barcode is scanned
  };

  const handleManualAdd = (product: Product) => {
    addProductToCart(product);
    setSearchTerm('');
  };

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, products]);


  const updateCartItem = (id: string, updates: Partial<CartItem>) => {
    setCart(prevCart => prevCart.map(item => item.id === id ? { ...item, ...updates } : item).filter(item => item.quantity > 0));
  };

  const handleQuantityChange = (item: CartItem, delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity > item.stock) {
        setNotification('Error: Not enough stock!');
        return;
    }
    updateCartItem(item.id, { quantity: newQuantity });
  };

  // Fixed error: Changed item.id to itemId as item was not defined in this scope
  const handlePriceSave = (itemId: string, newPrice: number) => {
    updateCartItem(itemId, { finalPrice: newPrice });
  };
  
  const subtotal = cart.reduce((acc, item) => acc + item.finalPrice * item.quantity, 0);
  const discountAmount = parseFloat(discountInput) || 0;
  const total = subtotal - discountAmount;

  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    const profit = cart.reduce((acc, item) => acc + (item.finalPrice - item.cost) * item.quantity, 0) - discountAmount;
    const discountPercentage = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0;

    const newSale: Sale = {
      id: `sale-${crypto.randomUUID()}`,
      date: new Date().toISOString(),
      items: cart,
      subtotal,
      discount: discountAmount,
      discountPercentage: discountPercentage,
      total,
      profit
    };

    setSaleToConfirm(newSale);
  };

  const handleFinalizeSale = (sale: Sale) => {
    addSale(sale);
    cart.forEach(item => updateStock(item.id, item.stock - item.quantity));
    setCart([]);
    setDiscountInput('');
    setSaleToConfirm(null);
    setNotification("Sale completed successfully!");
  };

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-8 h-full">
      {/* Cart Section */}
      <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 shadow-xl flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400 flex-shrink-0">Shopping Cart</h2>
        <div className="space-y-4 flex-grow overflow-y-auto pr-2">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center">
                <p className="text-gray-400 text-lg">Cart is empty. Scan a product to begin.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                <div className="flex items-center gap-4">
                  <img 
                    src={item.imageUrl || 'https://via.placeholder.com/64x64/374151/FFFFFF?text=No+Image'} 
                    alt={item.name} 
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                      <span>Threshold: PKR {(item.thresholdPrice ?? item.cost).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      <button onClick={() => setEditingPriceItem(item)} title="Edit Price" className="text-cyan-400 hover:text-cyan-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleQuantityChange(item, -1)} className="bg-gray-600 w-8 h-8 rounded-full font-bold">-</button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item, 1)} className="bg-gray-600 w-8 h-8 rounded-full font-bold">+</button>
                  </div>
                  <p className="font-bold w-24 text-right">PKR {(item.finalPrice * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  <button onClick={() => updateCartItem(item.id, { quantity: 0 })} className="text-red-400 hover:text-red-300">Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Barcode & Summary Section */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-cyan-400">Checkout</h2>
          <div>
            <label htmlFor="barcode" className="block text-sm font-medium text-gray-300 mb-2">Scan Barcode</label>
            <input
              ref={barcodeInputRef}
              id="barcode"
              type="text"
              value={barcode}
              onChange={handleBarcodeChange}
              className="w-full p-3 bg-gray-900 rounded-lg border-2 border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50 transition-all duration-300"
              placeholder="Ready for next scan..."
            />
          </div>

          <div className="mt-4 relative">
              <label htmlFor="manual-search" className="block text-sm font-medium text-gray-300 mb-2">Or Search Manually</label>
              <input
                  id="manual-search"
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full p-3 bg-gray-900 rounded-lg border-2 border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
                  placeholder="Type product name..."
              />
              {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map(product => (
                          <div
                              key={product.id}
                              onClick={() => handleManualAdd(product)}
                              className="p-3 hover:bg-gray-600 cursor-pointer flex items-center gap-4 border-b border-gray-600"
                          >
                              <img src={product.imageUrl || 'https://via.placeholder.com/40x40/374151/FFFFFF?text=N/A'} alt={product.name} className="w-10 h-10 object-cover rounded" />
                              <div>
                                  <p className="font-semibold">{product.name}</p>
                                  <p className="text-sm text-gray-400">PKR {product.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} - Stock: {product.stock}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>

          <div className="mt-8 space-y-3 border-t border-gray-700 pt-6">
            <div className="flex justify-between text-lg">
              <span className="text-gray-400">Subtotal:</span>
              <span className="font-semibold">PKR {subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-400">Discount (PKR):</span>
              <input 
                type="number"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value.replace(/[^0-9.]/g, ''))}
                className="w-24 p-1 bg-gray-900 rounded-lg border border-gray-600 text-right font-semibold"
                placeholder="0.00"
              />
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-400">Discount Amount:</span>
              <span className="font-semibold text-red-400">- PKR {discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-cyan-400">
              <span>Total:</span>
              <span>PKR {total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleCompleteSale}
          disabled={cart.length === 0}
          className="w-full mt-8 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 shadow-lg text-xl"
        >
          Complete Sale & Generate Bill
        </button>
      </div>
    </div>
    
    <BillModal 
      sale={saleToConfirm} 
      onClose={() => setSaleToConfirm(null)}
      onConfirm={handleFinalizeSale}
      shopSettings={shopSettings} 
    />
    <PriceEditModal
      isOpen={!!editingPriceItem}
      onClose={() => setEditingPriceItem(null)}
      onSave={handlePriceSave}
      item={editingPriceItem}
    />
    </>
  );
};