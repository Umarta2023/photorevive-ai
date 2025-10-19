import React, { useState } from 'react';
import WelcomeSlider from './WelcomeSlider';
import { useTranslations } from '../hooks/useTranslations';
import { UserIcon } from './icons/UserIcon';
import { LogoIcon } from './icons/LogoIcon';
import { GiftIcon } from './icons/GiftIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface WelcomeScreenProps {
  onLogin: (username: string, referralCode?: string) => Promise<void>;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLogin }) => {
  const t = useTranslations();
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && !isLoading) {
      setIsLoading(true);
      try {
        await onLogin(username.trim(), referralCode.trim());
      } catch (error) {
        console.error("Login failed", error);
        // Optionally: show an error message to the user
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-900">
        <div className="w-full lg:w-3/5 h-1/2 lg:h-full">
            <WelcomeSlider />
        </div>
        <div className="w-full lg:w-2/5 flex items-center justify-center p-8 lg:p-12">
            <div className="max-w-md w-full">
                 <div className="text-center lg:text-left mb-10">
                    <LogoIcon className="w-16 h-16 text-yellow-400 mx-auto lg:mx-0 mb-4" />
                    <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 leading-tight">{t.welcomeTitle}</h1>
                    <p className="text-lg text-gray-300 mt-2">{t.welcomeSubtitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username-input" className="block text-sm font-medium text-gray-300 mb-2">
                            {t.enterUsernameLabel}
                        </label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="username-input"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder={t.usernamePlaceholder}
                                required
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-gray-100 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="referral-input" className="block text-sm font-medium text-gray-300 mb-2">
                            {t.referralCodeLabel}
                        </label>
                        <div className="relative">
                            <GiftIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="referral-input"
                                type="text"
                                value={referralCode}
                                onChange={(e) => setReferralCode(e.target.value)}
                                placeholder={t.referralCodePlaceholder}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-gray-100 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={!username.trim() || isLoading}
                        className="w-full mt-4 bg-yellow-400 text-gray-900 font-bold py-3 px-4 rounded-lg shadow-md hover:bg-yellow-300 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 transition-all duration-300 ease-in-out flex items-center justify-center"
                    >
                        {isLoading ? <SpinnerIcon className="animate-spin w-5 h-5" /> : t.enterBtn}
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
};

export default WelcomeScreen;