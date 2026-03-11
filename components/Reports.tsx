
import React, { useState, useMemo } from 'react';
import type { Sale, ShopSettings } from '../types';
import { BillModal } from './BillModal';
import { ReportPrintModal } from './ReportPrintModal';

interface ReportsProps {
  sales: Sale[];
  shopSettings: ShopSettings;
  onReturnSale: (saleId: string) => void;
  requestPasswordVerification: (callback: () => void) => void;
}

const ConfirmReturnModal: React.FC<{
    sale: Sale | null;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ sale, onConfirm, onCancel }) => {
    if (!sale) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[60]">
            <div className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
                <h2 className="text-2xl font-bold mb-4 text-orange-400">Confirm Return</h2>
                <p className="mb-4 text-gray-300">Are you sure you want to return/void this sale? This action will restore stock and remove the sale from records.</p>
                <div className="bg-gray-700/50 p-3 rounded-md mb-6">
                    <p className="font-mono text-sm">Sale ID: {sale.id}</p>
                    <p className="font-bold text-cyan-400">Total: PKR {sale.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={onCancel} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded transition-colors">
                        No, Keep
                    </button>
                    <button onClick={onConfirm} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded transition-colors">
                        Yes, Return
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Reports: React.FC<ReportsProps> = ({ sales, shopSettings, onReturnSale, requestPasswordVerification }) => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toLocaleDateString('en-CA'));
  const [endDate, setEndDate] = useState(today.toLocaleDateString('en-CA'));
  const [saleToView, setSaleToView] = useState<Sale | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [saleToReturn, setSaleToReturn] = useState<Sale | null>(null);

  const filteredSales = useMemo(() => {
    if (!sales) return [];
    return sales.filter(sale => {
      const saleLocalDate = new Date(sale.date).toLocaleDateString('en-CA');
      return saleLocalDate >= startDate && saleLocalDate <= endDate;
    });
  }, [sales, startDate, endDate]);

  const summary = useMemo(() => {
    return filteredSales.reduce((acc, sale) => {
      acc.totalRevenue += sale.total;
      acc.totalProfit += sale.profit;
      acc.totalSales += 1;
      return acc;
    }, { totalRevenue: 0, totalProfit: 0, totalSales: 0 });
  }, [filteredSales]);

  const handleReturnConfirm = () => {
      if (saleToReturn) {
          requestPasswordVerification(() => {
              onReturnSale(saleToReturn.id);
          });
          setSaleToReturn(null);
      }
  };

  return (
    <>
      <div className="p-4 md:p-8">
        <div>
            <h2 className="text-3xl font-bold mb-6 text-cyan-400">Sales Reports</h2>
            <div className="bg-gray-800 p-6 rounded-lg mb-8 flex flex-wrap gap-6 items-center">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 bg-gray-700 rounded" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 bg-gray-700 rounded" />
              </div>
              <div className="flex-1 min-w-[200px] self-end">
                  <button onClick={() => setIsPrintModalOpen(true)} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors duration-300">
                      Print Report
                  </button>
              </div>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-gray-400 text-lg">Total Revenue</h3>
            <p className="text-3xl font-bold text-cyan-400">PKR {summary.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-gray-400 text-lg">Total Profit</h3>
            <p className="text-3xl font-bold text-green-400">PKR {summary.totalProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-gray-400 text-lg">Number of Sales</h3>
            <p className="text-3xl font-bold text-white">{summary.totalSales}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <h3 className="text-xl font-bold p-4 bg-gray-700">Sales History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Sale ID</th>
                  <th className="p-4 font-semibold">Items</th>
                  <th className="p-4 font-semibold text-right">Profit</th>
                  <th className="p-4 font-semibold text-right">Total Amount</th>
                  <th className="p-4 font-semibold text-center">Return</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length > 0 ? (
                  filteredSales.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((sale, index) => (
                    <tr key={sale.id} className={`${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900/50'}`}>
                      <td className="p-4">{new Date(sale.date).toLocaleString()}</td>
                      <td className="p-4">
                        <button onClick={() => setSaleToView(sale)} className="text-cyan-400 hover:underline font-mono text-sm">
                            {sale.id}
                        </button>
                      </td>
                      <td className="p-4">{sale.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                      <td className="p-4 text-right text-green-400 font-mono">PKR {sale.profit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      <td className="p-4 text-right font-bold font-mono">PKR {sale.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      <td className="p-4 text-center">
                          <button 
                            onClick={() => setSaleToReturn(sale)} 
                            title="Return/Void Sale"
                            className="text-gray-500 hover:text-orange-500 transition-colors p-1"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5" />
                              </svg>
                          </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-500">
                      No sales found in the selected date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <BillModal 
        sale={saleToView}
        onClose={() => setSaleToView(null)}
        shopSettings={shopSettings}
      />
      <ReportPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        sales={filteredSales}
        summary={summary}
        shopSettings={shopSettings}
        startDate={startDate}
        endDate={endDate}
      />
      <ConfirmReturnModal 
        sale={saleToReturn}
        onConfirm={handleReturnConfirm}
        onCancel={() => setSaleToReturn(null)}
      />
    </>
  );
};
