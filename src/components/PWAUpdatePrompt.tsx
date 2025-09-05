import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

interface PWAUpdatePromptProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

const PWAUpdatePrompt: React.FC<PWAUpdatePromptProps> = ({ onUpdate, onDismiss }) => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowPrompt(true);
      });
    }
  }, []);

  const handleUpdate = () => {
    onUpdate();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    onDismiss();
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            App Update Available
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            A new version of the app is available. Update now for the latest features and improvements.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handleUpdate}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Update</span>
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-gray-600 text-xs rounded-md hover:bg-gray-100 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;
