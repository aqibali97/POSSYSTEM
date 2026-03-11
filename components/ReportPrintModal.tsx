
import React from 'react';
import type { Sale, ShopSettings } from '../types';

interface ReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  sales: Sale[];
  summary: { totalRevenue: number; totalProfit: number; totalSales: number };
  shopSettings: ShopSettings;
  startDate: string;
  endDate: string;
}

export const ReportPrintModal: React.FC<ReportPrintModalProps> = ({
  isOpen,
  onClose,
  sales,
  summary,
  shopSettings,
  startDate,
  endDate,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };
  
  const formattedStartDate = new Date(startDate + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedEndDate = new Date(endDate + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 no-print">
      <div className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-4xl p-6 relative max-h-[90vh] flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400 flex-shrink-0">Print Preview</h2>
        
        <div id="report-print-modal-content" className="flex-grow overflow-y-auto bg-white p-6 text-black">
            <div className="flex justify-between items-center pb-4 border-b-2 border-black">
                <div>
                    <h1 className="text-3xl font-bold">{shopSettings.name}</h1>
                    <p className="text-lg">Sales Report</p>
                </div>
                <img src={shopSettings.logo} alt="Shop Logo" className="h-16 w-16 object-contain" />
            </div>
            <p className="mt-4 text-center text-sm">
                Report for period from <strong>{formattedStartDate}</strong> to <strong>{formattedEndDate}</strong>
            </p>

            <div className="grid grid-cols-3 gap-4 my-6 text-black">
              <div className="summary-card border border-gray-300 p-4 rounded-lg text-center">
                <h3 className="text-gray-600 text-base">Total Revenue</h3>
                <p className="text-2xl font-bold">PKR {summary.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </div>
              <div className="summary-card border border-gray-300 p-4 rounded-lg text-center">
                <h3 className="text-gray-600 text-base">Total Profit</h3>
                <p className="text-2xl font-bold text-green-700">PKR {summary.totalProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </div>
              <div className="summary-card border border-gray-300 p-4 rounded-lg text-center">
                <h3 className="text-gray-600 text-base">Number of Sales</h3>
                <p className="text-2xl font-bold">{summary.totalSales}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">Sales History</h3>
                <div className="text-sm">
                  <div className="flex p-2 font-bold border-b-2 border-black">
                      <div className="w-1/4">Date</div>
                      <div className="w-1/4">Sale ID</div>
                      <div className="w-1/6 text-center">Items</div>
                      <div className="w-1/6 text-right">Profit</div>
                      <div className="w-1/6 text-right">Total Amount</div>
                  </div>
                  <div>
                      {sales.length > 0 ? (
                        sales.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((sale) => (
                          <React.Fragment key={sale.id}>
                            <div className="sale-summary-row flex p-2">
                              <div className="w-1/4">{new Date(sale.date).toLocaleString()}</div>
                              <div className="w-1/4 font-mono text-xs">{sale.id}</div>
                              <div className="w-1/6 text-center">{sale.items.reduce((sum, item) => sum + item.quantity, 0)}</div>
                              <div className="w-1/6 text-right text-green-700">PKR {sale.profit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                              <div className="w-1/6 text-right">PKR {sale.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            </div>
                            <div className="sale-details-wrapper">
                                <div className="item-details-table text-xs">
                                  {sale.items.map((item, itemIndex) => (
                                      <div key={`${sale.id}-${item.id}-${itemIndex}`} className="flex py-1">
                                        <div className="flex-grow pr-1 pl-4 font-bold">{item.name}</div>
                                        <div className="w-24 text-right">Qty: {item.quantity}</div>
                                      </div>
                                  ))}
                                </div>
                              </div>
                          </React.Fragment>
                        ))
                      ) : (
                        <div className="text-center p-8 text-gray-500">
                          No sales found in the selected date range.
                        </div>
                      )}
                  </div>
                </div>
            </div>
        </div>

        <div className="flex-shrink-0 flex gap-4 mt-6 pt-4 border-t border-gray-700">
          <button onClick={onClose} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded">
            Close
          </button>
          <button onClick={handlePrint} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded">
            Print
          </button>
        </div>
      </div>
    </div>
  );
};
