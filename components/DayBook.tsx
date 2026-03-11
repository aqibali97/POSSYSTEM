
import React, { useState, useMemo } from 'react';
import type { DayBookEntry } from '../types';

const EntryForm: React.FC<{ addEntry: (entryData: Omit<DayBookEntry, 'id' | 'date'>) => void }> = ({ addEntry }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [entryType, setEntryType] = useState<'expense' | 'profit'>('expense');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amountNum = parseFloat(amount);
        if (!description.trim() || isNaN(amountNum) || amountNum <= 0) {
            alert('Please enter a valid description and a positive amount.');
            return;
        }
        addEntry({
            description,
            amount: amountNum,
            type: entryType,
        });
        setDescription('');
        setAmount('');
        setEntryType('expense');
    };
    
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 bg-gray-700/50 rounded-lg">
            <div className="flex gap-6 items-center">
                <span className="font-semibold">Entry Type:</span>
                <div className="flex items-center gap-4">
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="entryType" value="expense" checked={entryType === 'expense'} onChange={() => setEntryType('expense')} className="form-radio bg-gray-900 border-gray-600 text-cyan-600 focus:ring-cyan-500" />
                        <span>Expense</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="entryType" value="profit" checked={entryType === 'profit'} onChange={() => setEntryType('profit')} className="form-radio bg-gray-900 border-gray-600 text-cyan-600 focus:ring-cyan-500" />
                        <span>Profit</span>
                    </label>
                </div>
            </div>
            <div className="flex flex-wrap items-end gap-4">
                <div className="flex-grow">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <input
                        id="description"
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded"
                        placeholder={entryType === 'expense' ? 'e.g., Office Supplies, Rent' : 'e.g., Service Charge, Scrap Sale'}
                        required
                    />
                </div>
                <div className="w-full sm:w-auto">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Amount (PKR)</label>
                    <input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded"
                        placeholder="1000.00"
                        required
                    />
                </div>
                <button type="submit" className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded">
                    Add {entryType === 'expense' ? 'Expense' : 'Profit'}
                </button>
            </div>
        </form>
    );
};

const calculateDailyData = (selectedDate: string, entries: DayBookEntry[]) => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    const entriesForDay = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startOfDay && entryDate <= endOfDay;
    });

    const profitsForDay = entriesForDay
        .filter(e => e.type === 'profit')
        .map(entry => ({
            id: entry.id,
            time: new Date(entry.date),
            description: entry.description,
            type: 'Profit' as const,
            amount: entry.amount
        }));

    const expensesForDay = entriesForDay
      .filter(entry => entry.type === 'expense')
      .map(entry => ({
        id: entry.id,
        time: new Date(entry.date),
        description: entry.description,
        type: 'Expense' as const,
        amount: -entry.amount
      }));
      
    const combined = [...profitsForDay, ...expensesForDay].sort((a, b) => b.time.getTime() - a.time.getTime());
    const totalOtherProfits = profitsForDay.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = expensesForDay.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = totalOtherProfits;
    
    return {
        combined,
        totalIncome,
        totalExpenses,
        netFlow: totalIncome + totalExpenses,
    };
};

type CombinedEntry = ReturnType<typeof calculateDailyData>['combined'][0];

const ConfirmDeleteModal: React.FC<{
  entry: CombinedEntry | null;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ entry, onConfirm, onCancel }) => {
  if (!entry) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
        <h2 className="text-2xl font-bold mb-4 text-orange-400">Confirm Deletion</h2>
        <p className="mb-6 text-gray-300">Are you sure you want to delete this entry?</p>
        <blockquote className="border-l-4 border-gray-600 pl-4 mb-6 text-gray-400 italic">
          {entry.description}
        </blockquote>
        <div className="flex gap-4 mt-8">
          <button onClick={onCancel} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded">
            No, Cancel
          </button>
          <button onClick={onConfirm} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded">
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const SummaryCards: React.FC<{ totalIncome: number; totalExpenses: number; netFlow: number }> = ({ totalIncome, totalExpenses, netFlow }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h3 className="text-gray-400 text-lg">Total Income</h3>
          <p className="text-3xl font-bold text-green-400">PKR {totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h3 className="text-gray-400 text-lg">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-400">PKR {Math.abs(totalExpenses).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h3 className="text-gray-400 text-lg">Net Cash Flow</h3>
          <p className={`text-3xl font-bold ${netFlow >= 0 ? 'text-cyan-400' : 'text-orange-400'}`}>
            PKR {netFlow.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </p>
        </div>
    </div>
);

const TransactionTable: React.FC<{ combined: CombinedEntry[], onDeleteRequest: (entry: CombinedEntry) => void, title: string }> = ({ combined, onDeleteRequest, title }) => (
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden flex-grow flex flex-col min-h-[300px]">
        <h3 className="text-xl font-bold p-4 bg-gray-700/50">{title}</h3>
        <div className="overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-700 sticky top-0 z-10">
              <tr>
                <th className="p-4 font-semibold">Time</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {combined.length > 0 ? combined.map((item, index) => (
                <tr key={item.id} className={`${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900/50'}`}>
                  <td className="p-4">{item.time.toLocaleTimeString()}</td>
                  <td className="p-4">{item.description}</td>
                  <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.type === 'Profit' ? 'bg-green-600/50 text-green-300' : 'bg-red-600/50 text-red-300'}`}>
                          {item.type}
                      </span>
                  </td>
                  <td className={`p-4 text-right font-mono ${item.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    PKR {item.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                  <td className="p-4 text-center">
                    {(item.type === 'Expense' || item.type === 'Profit') && (
                        <button onClick={() => onDeleteRequest(item)} className="text-gray-400 hover:text-red-400" title="Delete Entry">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-500">
                        No entries for this date.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
);

interface DayBookProps {
  entries: DayBookEntry[];
  addEntry: (entry: DayBookEntry) => void;
  deleteEntry: (entryId: string) => void;
  requestPasswordVerification: (callback: () => void) => void;
}

export const DayBook: React.FC<DayBookProps> = ({ entries, addEntry, deleteEntry, requestPasswordVerification }) => {
    const todayDateString = useMemo(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    const [selectedDate, setSelectedDate] = useState(todayDateString);
    const [confirmingDelete, setConfirmingDelete] = useState<CombinedEntry | null>(null);
    const isToday = selectedDate === todayDateString;
    const displayedData = useMemo(() => calculateDailyData(selectedDate, entries), [selectedDate, entries]);

    const handleAddEntry = (entryData: Omit<DayBookEntry, 'id' | 'date'>) => {
        const newEntry: DayBookEntry = {
            ...entryData,
            id: `${entryData.type.slice(0,3)}-${Date.now()}`,
            date: new Date().toISOString(),
        };
        addEntry(newEntry);
    };

    const handleConfirmDelete = () => {
        if (confirmingDelete) {
            requestPasswordVerification(() => {
                deleteEntry(confirmingDelete.id);
            });
            setConfirmingDelete(null);
        }
    };

    const formatDisplayDate = (dateString: string) => {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
    const formattedSelectedDate = useMemo(() => formatDisplayDate(selectedDate), [selectedDate]);

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-cyan-400">Day Book</h2>
                <div className="flex-1 min-w-[200px] max-w-xs">
                    <label htmlFor="daybook-date-picker" className="block text-sm font-medium text-gray-300 mb-1">Select Date</label>
                    <input
                        type="date"
                        id="daybook-date-picker"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="w-full p-2 bg-gray-700 rounded"
                    />
                </div>
            </div>

            <SummaryCards 
                totalIncome={displayedData.totalIncome} 
                totalExpenses={displayedData.totalExpenses} 
                netFlow={displayedData.netFlow} 
            />
            
            {isToday ? (
                <div>
                    <h3 className="text-xl font-bold mb-4">Add New Entry</h3>
                    <EntryForm addEntry={handleAddEntry} />
                </div>
            ) : (
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <p className="text-gray-400">You are viewing a past date. New entries can only be added for today.</p>
                </div>
            )}

            <TransactionTable 
                title={`Transactions for ${formattedSelectedDate}`} 
                combined={displayedData.combined} 
                onDeleteRequest={setConfirmingDelete}
            />

            <ConfirmDeleteModal
                entry={confirmingDelete}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmingDelete(null)}
            />
        </div>
    );
};
