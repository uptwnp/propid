import React, { useEffect } from 'react';

interface PWAUpdatePromptProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

const PWAUpdatePrompt: React.FC<PWAUpdatePromptProps> = ({ onUpdate, onDismiss }) => {
  useEffect(() => {
    // Listen for service worker updates and auto-update
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service worker updated, reloading page...');
        onUpdate();
      });

      // Check for updates on page load
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.addEventListener('updatefound', () => {
            console.log('New service worker found, updating...');
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New service worker installed, reloading...');
                  onUpdate();
                }
              });
            }
          });
        }
      });
    }
  }, [onUpdate]);

  // No UI - auto-update silently
  return null;
};

export default PWAUpdatePrompt;
