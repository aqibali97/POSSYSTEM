
import React from 'react';
import type { Sale, ShopSettings } from '../types';

interface BillModalProps {
  sale: Sale | null;
  onClose: () => void;
  onConfirm?: (sale: Sale) => void;
  shopSettings: ShopSettings;
}

export const BillModal: React.FC<BillModalProps> = ({ sale, onClose, onConfirm, shopSettings }) => {
  const [isProcessing, setIsProcessing] = React.useState(false);
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleConfirm = () => {
    if (sale && onConfirm && !isProcessing) {
      setIsProcessing(true);
      onConfirm(sale);
    }
  };
  
  const receiptTitle = onConfirm ? "SALE RECEIPT" : "RECEIPT REPRINT";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
          
        {/* Printable Receipt Area */}
        <div id="bill-modal-content" className="font-mono text-xs bg-white p-4">
            <div className="text-center">
                <img src={shopSettings.logo} alt="Shop Logo" className="w-16 h-16 mx-auto mb-2 object-contain" />
                <h2 className="text-lg font-bold">{receiptTitle}</h2>
            </div>
            <div className="flex justify-between text-xs my-2">
                <span>ID: {sale.id}</span>
                <span>{new Date(sale.date).toLocaleString()}</span>
            </div>
            
            {/* Items Section using Flexbox */}
            <div className="w-full text-xs">
                {/* Header */}
                <div className="flex py-1 border-b-2 border-dashed border-black font-bold">
                    <div className="flex-1">ITEM</div>
                    <div className="w-10 text-center">QTY</div>
                    <div className="w-16 text-right">PRICE</div>
                    <div className="w-16 text-right">TOTAL</div>
                </div>
                {/* Body */}
                <div>
                    {sale.items.map(item => (
                        <div key={item.id} className="flex py-1">
                            <div className="flex-1 pr-1" style={{ wordBreak: 'break-word' }}>{item.name}</div>
                            <div className="w-10 text-center">{item.quantity}</div>
                            <div className="w-16 text-right">{item.finalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            <div className="w-16 text-right">{(item.quantity * item.finalPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t-2 border-dashed border-black mt-2 pt-2 text-xs">
                <div className="flex justify-between">
                    <span>SUBTOTAL</span>
                    <span>PKR {sale.subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between">
                    <span>DISCOUNT</span>
                    <span>-PKR {sale.discount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between font-bold text-sm mt-1">
                    <span>TOTAL</span>
                    <span>PKR {sale.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
            </div>
            <div className="text-center mt-4 text-xs">
                <p>Thank you for your business!</p>
                <p>Come again soon.</p>
            </div>
        </div>

        {/* Action Buttons (Non-Printable) */}
        <div className="no-print mt-8">
          {onConfirm ? (
            // POS View with confirmation
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleConfirm} 
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded"
              >
                {isProcessing ? "Processing..." : "Confirm & Finalize Sale"}
              </button>
              <div className="flex gap-2">
                <button onClick={onClose} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded">
                  Back to Cart
                </button>
                <button onClick={handlePrint} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded">
                  Print Bill
                </button>
              </div>
            </div>
          ) : (
            // Reports View (Reprint)
            <div className="flex gap-4">
              <button onClick={onClose} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded">
                Close
              </button>
              <button onClick={handlePrint} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded">
                Print Bill
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
