
import React, { useState, useEffect } from 'react';
import type { ShopSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ShopSettings;
  onSave: (newSettings: ShopSettings) => void;
  onRequestSetPassword: (mode: 'set' | 'change') => void;
  onRemovePassword: () => void;
  isPasswordSet: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onRequestSetPassword,
  onRemovePassword,
  isPasswordSet,
}) => {
  const [currentSettings, setCurrentSettings] = useState(settings);

  useEffect(() => {
    if (isOpen) {
      setCurrentSettings(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentSettings(prev => ({...prev, name: e.target.value}));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentSettings(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(currentSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-md p-6 relative overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-6 text-cyan-400">Shop Settings</h2>
        
        <div className="space-y-6">
            <div>
                <label htmlFor="shopName" className="block text-sm font-medium text-gray-300 mb-2">Shop Name</label>
                <input 
                    id="shopName"
                    type="text" 
                    value={currentSettings.name}
                    onChange={handleNameChange}
                    className="w-full p-3 bg-gray-900 rounded-lg border-2 border-gray-600 focus:border-cyan-500"
                />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                  <p className="block text-sm font-medium text-gray-300 mb-2">Current Logo</p>
                  <img src={currentSettings.logo} alt="Shop Logo Preview" className="h-24 w-24 object-contain rounded-md bg-gray-700 p-1" />
              </div>
              <div className="flex-1">
                  <label htmlFor="logoUpload" className="block text-sm font-medium text-gray-300 mb-2">Upload New Logo</label>
                  <input 
                      id="logoUpload"
                      type="file" 
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">For best results, use a logo with a transparent background.</p>
              </div>
            </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6 mt-6">
          <h3 className="text-xl font-bold mb-4 text-cyan-400">Security Settings</h3>
          <div className="space-y-4">
            {isPasswordSet ? (
              <div className="space-y-2">
                <p className="text-sm text-green-400 bg-green-900/20 p-3 rounded-md">Password protection is currently enabled.</p>
                <button 
                  onClick={() => onRequestSetPassword('change')} 
                  className="w-full text-left text-sm text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20 p-3 rounded-md transition-colors"
                >
                  Change Password
                </button>
                <button 
                  onClick={onRemovePassword} 
                  className="w-full text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 p-3 rounded-md transition-colors"
                >
                  Remove Password Protection
                </button>
                <p className="text-xs text-gray-500 mt-1">Removing protection will allow anyone to access all tabs.</p>
              </div>
            ) : (
              <div>
                <button 
                  onClick={() => onRequestSetPassword('set')} 
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded"
                >
                  Set Password to Enable Protection
                </button>
                <p className="text-xs text-gray-500 mt-2">
                    Clicking this will open a prompt to create a new password. Once set, protected tabs will require this password for access.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-8 pt-4 border-t border-gray-700">
          <button onClick={onClose} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded">
            Cancel
          </button>
          <button onClick={handleSave} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
