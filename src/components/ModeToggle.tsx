'use client';

interface ModeToggleProps {
  mode: 'ask' | 'agent';
  onChange: (mode: 'ask' | 'agent') => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="inline-flex items-center bg-gray-200 rounded-lg p-0.5">
      <button
        onClick={() => onChange('ask')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          mode === 'ask'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Ask
      </button>
      <button
        onClick={() => onChange('agent')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          mode === 'agent'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Agent
      </button>
    </div>
  );
}
