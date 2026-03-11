import React, { useEffect } from 'react';

// Let TypeScript know that JsBarcode is available on the window object
declare var JsBarcode: any;

interface BarcodeModalProps {
  barcode: string | null;
  onClose: () => void;
}

export const BarcodeModal: React.FC<BarcodeModalProps> = ({ barcode, onClose }) => {
  useEffect(() => {
    if (barcode) {
      try {
        JsBarcode("#barcode-canvas", barcode, {
          format: "CODE128",
          lineColor: "#ffffff",
          background: "#1f2937",
          width: 2,
          height: 80,
          displayValue: true,
          fontOptions: "bold",
          font: "monospace",
          fontSize: 18,
          textColor: "#ffffff",
        });
      } catch (e) {
        console.error("Error generating barcode", e);
      }
    }
  }, [barcode]);

  if (!barcode) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Barcode</title></head><body style="text-align:center; margin-top: 50px;">');
      const canvas = document.getElementById('barcode-canvas') as HTMLCanvasElement;
      if (canvas) {
        printWindow.document.write(`<img src="${canvas.toDataURL()}" />`);
      }
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div id="barcode-modal" className="bg-gray-800 text-white rounded-lg shadow-xl p-8 relative">
        <h3 className="text-xl font-bold mb-6 text-center text-cyan-400">Print Barcode</h3>
        <div className="bg-gray-700 p-4 rounded-md flex justify-center">
            <canvas id="barcode-canvas"></canvas>
        </div>
        <div className="flex gap-4 mt-8 no-print">
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
