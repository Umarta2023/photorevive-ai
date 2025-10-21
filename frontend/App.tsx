import React, { useState, useEffect } from 'react';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';
import SettingsModal from './components/SettingsModal';
import UpscalingModal from './components/UpscalingModal';
import WelcomeScreen from './components/WelcomeScreen';
import PaymentModal from './components/PaymentModal';
import { restorePhoto } from './services/apiService';
import { ResultItem, ComparisonMode, PromptMode } from './types';
import { useAuth } from './context/AuthContext';
import { useTranslations } from './hooks/useTranslations';

const App: React.FC = () => {
  const { user, isLoggedIn, login, credits, spendCredits, addCredits } = useAuth();
  const t = useTranslations();

  // Image & Result State
  const [originalImage, setOriginalImage] = useState<{ dataUrl: string; mimeType: string } | null>(null);
  const [processingImage, setProcessingImage] = useState<{ dataUrl: string; mimeType: string } | null>(null);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);

  // UI State
  const [prompt, setPrompt] = useState<string>('Retouch this photo');
  const [promptMode, setPromptMode] = useState<PromptMode>('retouch');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpscaling, setIsUpscaling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('slider');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  
  // Quota/Cooldown State
  const [isQuotaLimited, setIsQuotaLimited] = useState(false);
  const [quotaCooldownRemaining, setQuotaCooldownRemaining] = useState(0);

  // Custom Prompts
  const [customPrompts, setCustomPrompts] = useState<string[]>(() => {
    const saved = localStorage.getItem('customPrompts');
    return saved ? JSON.parse(saved) : [];
  });
  
  const processCost = promptMode === 'retouch' ? 10 : 20;

  // Effects
  useEffect(() => {
    localStorage.setItem('customPrompts', JSON.stringify(customPrompts));
  }, [customPrompts]);

  useEffect(() => {
    if (isQuotaLimited) {
      const timer = setInterval(() => {
        setQuotaCooldownRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsQuotaLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isQuotaLimited]);
  
  // Handlers
  const handleImageUpload = (imageDataUrl: string, mimeType: string) => {
    const newImage = { dataUrl: imageDataUrl, mimeType };
    setOriginalImage(newImage);
    setProcessingImage(newImage);
    const originalResult: ResultItem = { id: `original-${Date.now()}`, imageUrl: imageDataUrl, prompt: 'Original Image', mimeType: mimeType };
    setResults([originalResult]);
    setSelectedResultId(originalResult.id);
    setError(null);
  };
  
  const handleRestore = async () => {
    if (!processingImage || isLoading || !user) return;

    const success = await spendCredits(processCost);
    if (!success) {
      setError(t.notEnoughCreditsError);
      return;
    }

    setIsLoading(true);
    setError(null);
    const base64Data = processingImage.dataUrl.split(',')[1];
    
    try {
      const result = await restorePhoto(base64Data, processingImage.mimeType, prompt);
      if (result) {
        const newResult: ResultItem = {
          id: `result-${Date.now()}`,
          imageUrl: result.imageUrl,
          prompt: prompt,
          mimeType: result.mimeType,
        };
        setResults(prev => [...prev, newResult]);
        setSelectedResultId(newResult.id);
      } else {
        setError("The model did not return an image. Please try a different prompt or image.");
      }
    } catch (e: any) {
        if (e.message.startsWith('QUOTA_EXCEEDED')) {
            setIsQuotaLimited(true);
            setQuotaCooldownRemaining(60);
        }
        setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    if (originalImage) {
      setProcessingImage(originalImage);
      const originalResult = results.find(r => r.prompt === 'Original Image');
      if (originalResult) {
        setSelectedResultId(originalResult.id);
      }
    }
  };

  const handleSelectResult = (result: ResultItem) => {
    setSelectedResultId(result.id);
  };

  const handleUseAsSource = (result: ResultItem) => {
    setProcessingImage({ dataUrl: result.imageUrl, mimeType: result.mimeType });
    setSelectedResultId(result.id);
  };

  const handleDownloadResult = (result: ResultItem) => {
    const link = document.createElement('a');
    link.href = result.imageUrl;
    link.download = `restored_${result.id}.${result.mimeType.split('/')[1] || 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpscaleAndDownload = async (result: ResultItem) => {
    // This is a mock of an upscale feature.
    setIsUpscaling(true);
    await new Promise(res => setTimeout(res, 2000));
    setIsUpscaling(false);
    handleDownloadResult(result);
  };

  const handleClearAll = () => {
    const original = results.find(r => r.prompt === 'Original Image');
    setResults(original ? [original] : []);
    if (original) setSelectedResultId(original.id);
  };

  const handleAddCustomPrompt = (newPrompt: string) => {
    if (newPrompt && !customPrompts.includes(newPrompt)) {
      setCustomPrompts(prev => [newPrompt, ...prev]);
    }
  };
  
  const handleDeleteCustomPrompt = (promptToDelete: string) => {
    setCustomPrompts(prev => prev.filter(p => p !== promptToDelete));
  };
  
  const handleImageEdited = (editedDataUrl: string, mimeType: string) => {
    const editedResult: ResultItem = {
      id: `edited-${Date.now()}`,
      imageUrl: editedDataUrl,
      prompt: 'Image Edited',
      mimeType: mimeType
    };
    setProcessingImage({ dataUrl: editedDataUrl, mimeType });
    setResults(prev => [...prev, editedResult]);
    setSelectedResultId(editedResult.id);
  };

  const getImageDimensions = (image: string | null): Promise<{ width: number, height: number } | null> => {
    return new Promise(resolve => {
        if (!image) { resolve(null); return; }
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => resolve(null);
        img.src = image;
    });
  }

  const [beforeImageDimensions, setBeforeImageDimensions] = useState(null);
  const [afterImageDimensions, setAfterImageDimensions] = useState(null);
  
  const selectedResult = results.find(r => r.id === selectedResultId);
  const beforeImage = processingImage?.dataUrl;
  const afterImage = (selectedResult?.prompt !== 'Original Image') ? selectedResult?.imageUrl : null;
  
  useEffect(() => {
    getImageDimensions(beforeImage).then(setBeforeImageDimensions as any);
    getImageDimensions(afterImage).then(setAfterImageDimensions as any);
  }, [beforeImage, afterImage]);

  if (!isLoggedIn) {
    return <WelcomeScreen onLogin={login} />;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        <UpscalingModal isOpen={isUpscaling} />
        <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} onSuccess={(amount) => { addCredits(amount); setIsPaymentOpen(false); }} />

        <LeftPanel
            onImageUpload={handleImageUpload}
            processingImageUrl={processingImage?.dataUrl || null}
            prompt={prompt}
            setPrompt={setPrompt}
            onRestore={handleRestore}
            isLoading={isLoading}
            hasImage={!!originalImage}
            onReset={handleReset}
            isProcessingOriginal={selectedResult?.prompt === 'Original Image'}
            customPrompts={customPrompts}
            onAddCustomPrompt={handleAddCustomPrompt}
            onDeleteCustomPrompt={handleDeleteCustomPrompt}
            promptMode={promptMode}
            setPromptMode={setPromptMode}
            isEditing={isEditing}
            onOpenSettings={() => setIsSettingsOpen(true)}
            isQuotaLimited={isQuotaLimited}
            quotaCooldownRemaining={quotaCooldownRemaining}
            processCost={processCost}
            userCredits={credits}
            onAddCredits={() => setIsPaymentOpen(true)}
        />

        <CenterPanel
            beforeImage={beforeImage || null}
            afterImage={afterImage || null}
            mimeType={processingImage?.mimeType || 'image/png'}
            comparisonMode={comparisonMode}
            setComparisonMode={setComparisonMode}
            isLoading={isLoading}
            error={error}
            hasImage={!!originalImage}
            imageDimensions={beforeImageDimensions as any}
            beforeImageDimensions={beforeImageDimensions as any}
            afterImageDimensions={afterImageDimensions as any}
            onImageEdited={handleImageEdited}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            selectedResult={selectedResult || null}
            onOpenPaymentModal={() => setIsPaymentOpen(true)}
        />

        <RightPanel
            results={results}
            selectedResultId={selectedResultId}
            onSelectResult={handleSelectResult}
            onUseAsSource={handleUseAsSource}
            onDownloadResult={handleDownloadResult}
            onUpscaleAndDownload={handleUpscaleAndDownload}
            onClearAll={handleClearAll}
            isLoading={isLoading}
        />
    </div>
  );
};

export default App;