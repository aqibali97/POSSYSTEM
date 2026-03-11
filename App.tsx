
import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Product, Sale, ShopSettings, DayBookEntry } from './types';
import { POS } from './components/POS';
import { Inventory } from './components/Inventory';
import { Reports } from './components/Reports';
import { Catalog } from './components/Catalog';
import { SettingsModal } from './components/SettingsModal';
import { PasswordModal } from './components/PasswordModal';
import { DayBook } from './components/DayBook';

const PosIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const InventoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const ReportsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const CatalogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>;
const DayBookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const defaultLogo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAReSURBVHic7Z1xreJAEMd/b+8gIhAQCIRCIRAIBALhECgEAoFAIBAIBALhECgEAoGEQCAgEAgEAoFA+FkIlU53uztmzpxvJplMdi43jSZbv/P2rN8CQUgphRBCiNlsNoQQQgiFQkEQhBBCCCGEEEIIIYQQQgghhBBCCH8+gBBSimWMx+Nx9/v9/9NqtYQQQgj/NYBSSqFp2uVSKpVSCCH8YwCltCfT6XQ2Gg0hhPBPAMgYj8dTKpUKIYTw9wDICIfD2bhcLiGE8A8A6uFwOFoul0MI4R8A1NPpdLa+vi6EEAIAuufn5+10OiGEEADQ3d3drdfrIYQQAKher7e7u7sRQggA6Ovr62azGUIIIQCatm0ul0sIIYQA0HXdfr9fCCEEAGitVmt3d3cjhBACgLXb7W42m0IIIQCo1+tta9sihBACwFqv162rq0MI4W8CKMvy+XwuSRJCCCGA4XAYY4wQQgAwm802m00hhBAAWK/XG41GIYQQALS2bS6XSyGEEACstVotDAahhBACAGpra8uyHEIIAQBSSsuybDabIYQQANDv92s0GkIIIQCorq6uVquFEEIAoFKpLC8vjyAIIYQAgGEYTCYTQgghAKCyshJjDCEEAMC0bLlcDiGEAEBtbW21Wi2EEAIAyq/XaxjGEEIAIC8vL5fLhRAiBACkUqmsrq6GEEIAYBgG0zShBAEAsN1ul8vlEEKIEACQy+Xq9XohBACgUqlsbW2FEEIAkMvlcrlcCCEASAQCAfl8vpRSCCEEAIZhaJpEIBAIIYQAwDAMYwxjDAEhhADw+/32+/1+v58QAgAwmUwmk8kYw8gYAgghAMjn841Go9FoBAEAEkIIyufzrut+vx8BAGtra7Ozs/V6vSRJPM8jhBDCMAzDMAzDMAzDCCGEEEIIIYQQQgghhBBCCH8zQAihlpTSzGazEEIIIYS/CaCUUklKafb7/Wq1gs/nI4QQAojFYqWUQgh/C0AppZTSbDaLvV6vXC6HIAghBAA0TdM0TdM0CSGE8HcA0zSNx+ORJAkhhPBPANM0jcfjkSQJIYTwnwGMMTQajeFwGAEhhADwer1er9cYwxhjCCGE8E8AxpgxhiRJ0zQJIQQApmkajeEwYgxCCCGEfz1ACCml4XAYzWYjhBACCH8TQEin04lEIoQQQgghhBBCCCGEEEIIIYQQQggh/OsAP5w7OzuEENq27XQ6lWVZ27YJIQR/GkC5XM5kMhFCaJqmy+UyhRD+NYBCCH0+n1KpVENDCCGEPwlACCH0er2azWa9Xm9ZliRJgiCYTqfRaDSbzWY6nWKMeDxepVISRJCCCGEvyXo6+uLx+Oh67qmaZIkYRgGlmXRdZ3neRzH+Xw+j8djiqKmaSqVCkIIIYQQQgghhBBCCCGEEEIIIYQQ/nUEIYR/HKCenh5CCCGEEEIIIYQQQgghhBBCCH8/AP8D0rY7d+Vw4JMAAAAASUVORK5CYII=';

const TABS = {
  pos: 'Point of Sale',
  inventory: 'Add Product',
  reports: 'Reports',
  catalog: 'Categories',
  daybook: 'Day Book',
};
const PROTECTED_TABS = [TABS.inventory, TABS.reports, TABS.catalog, TABS.daybook];

export default function App() {
  const [products, setProducts] = useLocalStorage<Product[]>('pos-products', []);
  const [sales, setSales] = useLocalStorage<Sale[]>('pos-sales', []);
  const [dayBookEntries, setDayBookEntries] = useLocalStorage<DayBookEntry[]>('pos-daybook-entries', []);
  const [shopSettings, setShopSettings] = useLocalStorage<ShopSettings>('pos-settings', {
    name: 'AMS Store',
    logo: defaultLogo,
  });
  const [appPassword, setAppPassword] = useLocalStorage<string | null>('pos-app-password', null);

  const [activeTab, setActiveTab] = useState(TABS.pos);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  const [pendingAction, setPendingAction] = useState<'change' | 'remove' | null>(null);
  const [passwordSuccessCallback, setPasswordSuccessCallback] = useState<(() => void) | null>(null);

  const [passwordModalState, setPasswordModalState] = useState({
    isOpen: false,
    mode: 'enter' as 'set' | 'enter' | 'verify',
    title: 'Enter Password',
    description: 'This area is password protected.',
    targetTab: undefined as string | undefined,
  });

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const addProduct = useCallback((product: Product) => {
    setProducts(prev => [...prev, product]);
    setNotification(`Product "${product.name}" added successfully.`);
  }, [setProducts, setNotification]);

  const editProduct = useCallback((updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setNotification(`Product "${updatedProduct.name}" updated successfully.`);
  }, [setProducts, setNotification]);

  const deleteProduct = useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setNotification(`Product deleted successfully.`);
  }, [setProducts, setNotification]);

  const addSale = useCallback((sale: Sale) => {
    setSales(prev => {
      if (prev.some(s => s.id === sale.id)) {
        console.warn(`Sale with ID ${sale.id} already exists. Skipping.`);
        return prev;
      }
      return [...prev, sale];
    });
  }, [setSales]);

  const returnSale = useCallback((saleId: string) => {
    const saleToReturn = sales.find(s => s.id === saleId);
    if (!saleToReturn) return;

    setProducts(prevProducts => prevProducts.map(product => {
      const itemInSale = saleToReturn.items.find(item => item.id === product.id);
      if (itemInSale) {
        return { ...product, stock: product.stock + itemInSale.quantity };
      }
      return product;
    }));

    setSales(prevSales => prevSales.filter(s => s.id !== saleId));
    setNotification(`Sale ${saleId} returned successfully. Stock restored.`);
  }, [sales, setProducts, setSales, setNotification]);

  const updateStock = useCallback((productId: string, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
  }, [setProducts]);
  
  const addDayBookEntry = useCallback((entry: DayBookEntry) => {
    setDayBookEntries(prev => [...prev, entry]);
    setNotification(`Entry "${entry.description}" added successfully.`);
  }, [setDayBookEntries, setNotification]);

  const deleteDayBookEntry = useCallback((entryId: string) => {
    setDayBookEntries(prev => prev.filter(e => e.id !== entryId));
    setNotification(`Entry deleted successfully.`);
  }, [setDayBookEntries, setNotification]);

  const requestPasswordVerification = useCallback((callback: () => void) => {
    if (!appPassword) {
      callback();
      return;
    }
    setPasswordSuccessCallback(() => callback);
    setPasswordModalState({
      isOpen: true,
      mode: 'enter',
      title: 'Admin Approval Required',
      description: 'Please enter the password to proceed with this action.',
      targetTab: undefined,
    });
  }, [appPassword]);

  const handlePasswordSuccess = (password?: string) => {
    const actionToPerform = passwordSuccessCallback;
    const { mode, targetTab } = passwordModalState;

    setPasswordModalState({ isOpen: false, mode: 'enter', title: '', description: '', targetTab: undefined });
    setPasswordSuccessCallback(null);

    if (mode === 'verify') {
      if (pendingAction === 'change') {
        setPendingAction(null);
        setPasswordModalState({
          isOpen: true,
          mode: 'set',
          title: 'Set a New Password',
          description: 'Please create your new password.',
          targetTab: undefined,
        });
      } else if (pendingAction === 'remove') {
        setPendingAction(null);
        setAppPassword(null);
        setNotification('Password protection has been removed.');
      }
    } else if (mode === 'set') {
      if (password) {
        const isChanging = !!appPassword;
        setAppPassword(password);
        setNotification(isChanging ? 'Password changed successfully!' : 'Password set successfully!');
      }
    } else if (mode === 'enter') {
      if (targetTab) {
        setActiveTab(targetTab);
      } else if (actionToPerform) {
        actionToPerform();
      }
    }
  };
  
  const handlePasswordModalClose = () => {
    setPendingAction(null);
    setPasswordSuccessCallback(null);
    setPasswordModalState({ isOpen: false, mode: 'enter', title: '', description: '', targetTab: undefined });
  };

  const handleTabClick = (tab: string) => {
    if (activeTab === tab) return;
    const isTargetProtected = PROTECTED_TABS.includes(tab);
    if (!isTargetProtected || !appPassword) {
        setActiveTab(tab);
        return;
    }
    const isCurrentTabProtected = PROTECTED_TABS.includes(activeTab);
    if (isCurrentTabProtected) {
        setActiveTab(tab);
    } else {
        setPasswordModalState({ 
          isOpen: true, 
          mode: 'enter', 
          title: 'Enter Password',
          description: 'This area is password protected.',
          targetTab: tab 
        });
    }
  };
  
  const handleSettingsSave = (newSettings: ShopSettings) => {
    setShopSettings(newSettings);
    setNotification('Settings saved successfully!');
  };

  const handlePasswordActionRequest = (action: 'set' | 'change') => {
    setIsSettingsOpen(false);
    if (action === 'set') {
      setPasswordModalState({
        isOpen: true,
        mode: 'set',
        title: 'Create a Password',
        description: 'Please create a password to protect sensitive tabs.',
        targetTab: undefined,
      });
    } else if (action === 'change') {
      setPendingAction('change');
      setPasswordModalState({
        isOpen: true,
        mode: 'verify',
        title: 'Verify Your Identity',
        description: 'Please enter your current password to continue.',
        targetTab: undefined,
      });
    }
  };
  
  const handleRemovePassword = () => {
    setIsSettingsOpen(false);
    setPendingAction('remove');
    setPasswordModalState({
      isOpen: true,
      mode: 'verify',
      title: 'Confirm Password Removal',
      description: 'Please enter your current password to remove protection.',
      targetTab: undefined,
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case TABS.pos:
        return <POS products={products} addSale={addSale} updateStock={updateStock} setNotification={setNotification} shopSettings={shopSettings} />;
      case TABS.inventory:
        return <Inventory products={products} addProduct={addProduct} editProduct={editProduct} deleteProduct={deleteProduct} requestPasswordVerification={requestPasswordVerification} />;
      case TABS.reports:
        return <Reports sales={sales} shopSettings={shopSettings} onReturnSale={returnSale} requestPasswordVerification={requestPasswordVerification} />;
      case TABS.catalog:
        return <Catalog products={products} />;
      case TABS.daybook:
        return <DayBook entries={dayBookEntries} addEntry={addDayBookEntry} deleteEntry={deleteDayBookEntry} requestPasswordVerification={requestPasswordVerification} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-gray-200 flex flex-col">
      <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-4">
          <img src={shopSettings.logo} alt="Logo" className="h-12 w-12 object-contain" />
          <h1 className="text-2xl font-bold text-white">{shopSettings.name}</h1>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title="Settings">
              <SettingsIcon />
           </button>
        </div>
      </header>
      <nav className="bg-gray-800 border-t border-b border-gray-700 flex flex-shrink-0 overflow-x-auto">
        {Object.values(TABS).map(tab => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`flex items-center gap-2 py-3 px-6 font-semibold transition-colors duration-300 flex-shrink-0 ${activeTab === tab ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          >
            {tab === TABS.pos && <PosIcon />}
            {tab === TABS.inventory && <InventoryIcon />}
            {tab === TABS.reports && <ReportsIcon />}
            {tab === TABS.catalog && <CatalogIcon />}
            {tab === TABS.daybook && <DayBookIcon />}
            {tab}
          </button>
        ))}
      </nav>
      <main className="flex-grow overflow-y-auto">
        {renderContent()}
      </main>

      {notification && (
        <div className="fixed bottom-5 right-5 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-out z-50">
          {notification}
        </div>
      )}

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={shopSettings}
        onSave={handleSettingsSave}
        isPasswordSet={!!appPassword}
        onRequestSetPassword={handlePasswordActionRequest}
        onRemovePassword={handleRemovePassword}
      />
      <PasswordModal
        isOpen={passwordModalState.isOpen}
        onClose={handlePasswordModalClose}
        onSuccess={handlePasswordSuccess}
        mode={passwordModalState.mode}
        title={passwordModalState.title}
        description={passwordModalState.description}
        correctPassword={appPassword || undefined}
      />
    </div>
  );
}
