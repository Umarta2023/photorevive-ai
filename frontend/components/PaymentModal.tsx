import React, { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { XIcon } from './icons/XIcon';
// FIX: Corrected import path
import { CreditPackage } from '../types';
import { CreditIcon } from './icons/CreditIcon';
import { CardIcon } from './icons/CardIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

const CREDIT_PACKAGES: CreditPackage[] = [
    { credits: 100, price: 199 },
    { credits: 500, price: 799 },
    { credits: 1000, price: 1299 },
];

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const t = useTranslations();
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage>(CREDIT_PACKAGES[0]);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'phone'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
        onSuccess(selectedPackage.credits);
        setIsProcessing(false);
    }, 1500);
  }

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md text-gray-100 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-300">{t.buyCreditsTitle}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handlePayment} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t.selectPackage}</label>
                <div className="grid grid-cols-3 gap-3">
                    {CREDIT_PACKAGES.map(pkg => (
                        <button
                            key={pkg.credits}
                            type="button"
                            onClick={() => setSelectedPackage(pkg)}
                            className={`p-3 rounded-lg text-center transition border-2 ${selectedPackage.credits === pkg.credits ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300' : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'}`}
                        >
                            <p className="font-bold text-lg flex items-center justify-center">
                                <CreditIcon className="w-5 h-5 mr-1.5"/>
                                {pkg.credits}
                            </p>
                            <p className="text-xs text-gray-400">{pkg.price} ₽</p>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t.paymentMethod}</label>
                <div className="flex border-b border-gray-700 mb-4">
                    <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`flex-1 py-2 text-sm font-semibold transition-colors flex items-center justify-center space-x-2 ${paymentMethod === 'card' ? 'text-yellow-300 border-b-2 border-yellow-300' : 'text-gray-400 hover:text-gray-100'}`}
                    >
                        <CardIcon className="w-5 h-5"/>
                        <span>{t.creditCard}</span>
                    </button>
                    <button 
                        type="button"
                        onClick={() => setPaymentMethod('phone')}
                        className={`flex-1 py-2 text-sm font-semibold transition-colors flex items-center justify-center space-x-2 ${paymentMethod === 'phone' ? 'text-yellow-300 border-b-2 border-yellow-300' : 'text-gray-400 hover:text-gray-100'}`}
                    >
                        <PhoneIcon className="w-5 h-5"/>
                        <span>{t.phoneNumber}</span>
                    </button>
                </div>

                {paymentMethod === 'card' ? (
                    <div className="space-y-3">
                        <input type="text" placeholder={t.cardNumber} required className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-100 focus:ring-1 focus:ring-yellow-400" />
                        <div className="flex space-x-3">
                            <input type="text" placeholder={t.expiryDate} required className="w-1/2 bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-100 focus:ring-1 focus:ring-yellow-400" />
                            <input type="text" placeholder={t.cvc} required className="w-1/2 bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-100 focus:ring-1 focus:ring-yellow-400" />
                        </div>
                    </div>
                ) : (
                     <input type="tel" placeholder={t.phoneNumberLabel} required className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-100 focus:ring-1 focus:ring-yellow-400" />
                )}
            </div>
            
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full flex items-center justify-center bg-yellow-400 text-gray-900 font-bold py-3 px-4 rounded-lg shadow-md hover:bg-yellow-300 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
            >
              {isProcessing ? (
                  <>
                    <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />
                    {t.paymentProcessing}
                  </>
              ) : (
                  `${t.payBtn} ${selectedPackage.price} ₽`
              )}
            </button>
        </form>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PaymentModal;