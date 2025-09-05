import React from 'react';
import { AlertCircle } from 'lucide-react';

interface StateIndicatorProps {
  error?: string | null;
}

/**
 * Simple component that shows error status only
 */
const StateIndicator: React.FC<StateIndicatorProps> = ({ 
  error 
}) => {
  // Don't show anything if there's no error
  if (!error) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[1100] bg-white rounded-lg shadow-lg px-3 py-2 flex items-center gap-2 text-sm">
      <AlertCircle className="w-4 h-4 text-red-600" />
      <span className="text-red-600">Save failed</span>
    </div>
  );
};

export default StateIndicator;
