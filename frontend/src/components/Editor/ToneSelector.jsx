import React from 'react';
import { useEditorStore } from '../../store/editor.store.js';

const ToneSelector = () => {
  const { tone, setTone } = useEditorStore();

  const tones = [
    { id: 'casual', label: 'Casual', desc: 'Relaxed, everyday language' },
    { id: 'professional', label: 'Professional', desc: 'Formal, workplace-ready' },
    { id: 'conversational', label: 'Conversational', desc: 'Warm, natural dialogue' },
    { id: 'academic', label: 'Academic', desc: 'Scholarly but readable' },
  ];

  return (
    <div className="flex flex-wrap gap-2 md:gap-3 my-4">
      {tones.map((t) => {
        const isActive = tone === t.id;
        return (
          <div key={t.id} className="relative group">
            <button
              onClick={() => setTone(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {t.label}
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 dark:bg-gray-100 dark:text-gray-900">
              {t.desc}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-100" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ToneSelector;
