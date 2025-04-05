import React from 'react';
import { useLayout } from './LayoutContext';

export default function DebugButton() {
  const { isCategoryVisible, toggleCategoryVisibility } = useLayout();

  return (
    <button 
      className="bg-red-500 text-white p-2 rounded"
      onClick={() => {
        console.log('Debug button clicked');
        toggleCategoryVisibility();
      }}
    >
      Toggle Category (Debug) - Current: {isCategoryVisible ? 'Visible' : 'Hidden'}
    </button>
  );
}
