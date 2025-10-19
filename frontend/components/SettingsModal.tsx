import React, { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslations } from '../hooks/useTranslations';
import { XIcon } from './icons/XIcon';
import { useAuth } from '../context/AuthContext';
import { LogoutIcon } from './icons/LogoutIcon';
import { UsersIcon } from './icons/UsersIcon';
import { CheckIcon } from './icons/CheckIcon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const t = useTranslations();
  const { user, logout } = useAuth();
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;
  
  const handleCopy = () => {
      if(user?.referralCode) {
          navigator.clipboard.writeText(user.referralCode);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
      }
  }

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 w-full max-w-sm text-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-300">{t.settingsTitle}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t.languageLabel}</label>
            <LanguageSwitcher />
          </div>

          {user && (
            <div className="border-t border-gray-700 pt-4 mt-4 space-y-4">
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h3 className="text-md font-semibold text-gray-300 mb-3 flex items-center"><UsersIcon className="w-5 h-5 mr-2 text-yellow-400"/> {t.referFriendTitle}</h3>
                <p className="text-xs text-gray-400 mb-3">{t.referFriendBody}</p>
                <div className="flex items-center space-x-2">
                  <input type="text" readOnly value={user.referralCode} className="w-full flex-grow bg-gray-700 border border-gray-600 rounded-md py-1.5 px-3 text-gray-100 font-mono text-sm" />
                  <button onClick={handleCopy} className={`w-24 text-sm font-semibold py-1.5 px-3 rounded-md transition-colors ${isCopied ? 'bg-green-500 text-white' : 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'}`}>
                    {isCopied ? <span className="flex items-center justify-center"><CheckIcon className="w-4 h-4 mr-1"/> {t.copiedBtn}</span> : t.copyBtn}
                  </button>
                </div>
                 <p className="text-sm text-gray-400 mt-3 text-center">
                    {t.friendsReferred}: <span className="font-bold text-yellow-300">{user.referralCount || 0}</span>
                </p>
              </div>

              <div className="text-center space-y-3">
                <p className="text-sm text-gray-400">
                  {t.loggedInAs}: <span className="font-semibold text-gray-200">{user.name}</span>
                </p>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center bg-gray-700 text-gray-300 font-bold py-2 px-4 rounded-lg hover:bg-red-600 hover:text-white disabled:opacity-40 transition"
                >
                  <LogoutIcon className="w-5 h-5 mr-2" />
                  {t.logoutBtn}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;