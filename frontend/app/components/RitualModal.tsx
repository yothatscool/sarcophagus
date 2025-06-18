'use client';

import { useState } from 'react';
import { useVereavementContract } from '../hooks/useVereavementContract';
import { useNotification } from '../contexts/NotificationContext';
import { useLoading } from '../contexts/LoadingContext';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface RitualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Documentation for ritual types
const RITUAL_TYPES = {
  MEDITATION: {
    id: 'MEDITATION',
    name: 'Meditation Ritual',
    description: 'A mindful practice to honor and remember. Increases Longevity Score by meditation duration.',
    value: 'meditation',
  },
  TREE_PLANTING: {
    id: 'TREE_PLANTING',
    name: 'Tree Planting',
    description: 'Plant a tree in memory. Significantly increases Carbon Offset score.',
    value: 'tree_planting',
  },
  STORY_SHARING: {
    id: 'STORY_SHARING',
    name: 'Story Sharing',
    description: 'Share a meaningful story or memory. Enhances the Memorial value.',
    value: 'story_sharing',
  },
  CHARITABLE_GIVING: {
    id: 'CHARITABLE_GIVING',
    name: 'Charitable Giving',
    description: 'Make a charitable donation in memory. Increases Ritual Value.',
    value: 'charitable_giving',
  },
};

export default function RitualModal({ isOpen, onClose }: RitualModalProps) {
  const [selectedRitual, setSelectedRitual] = useState('');
  const [details, setDetails] = useState('');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const { completeRitual } = useVereavementContract();
  const { showNotification } = useNotification();
  const { isLoading, setLoading } = useLoading();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRitual) {
      showNotification('Please select a ritual type', 'warning');
      return;
    }

    setLoading('completeRitual', true);
    try {
      const tx = await completeRitual(selectedRitual);
      showNotification('Completing ritual...', 'info');
      await tx.wait();
      showNotification('Ritual completed successfully!', 'success');
      onClose();
      setSelectedRitual('');
      setDetails('');
    } catch (error) {
      console.error('Error completing ritual:', error);
      showNotification('Failed to complete ritual', 'error');
    }
    setLoading('completeRitual', false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1f2e] rounded-2xl p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-amber-400">Complete Ritual</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-4">Select Ritual Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(RITUAL_TYPES).map((ritual) => (
                <div
                  key={ritual.id}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedRitual === ritual.value
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-gray-700 hover:border-amber-500/50'
                  }`}
                  onClick={() => setSelectedRitual(ritual.value)}
                  onMouseEnter={() => setShowTooltip(ritual.id)}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{ritual.name}</span>
                    <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  {showTooltip === ritual.id && (
                    <div className="absolute z-10 w-64 p-3 bg-gray-800 rounded-lg shadow-lg text-sm text-gray-300 -top-2 left-full ml-2">
                      {ritual.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Additional Details (Optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white h-32 resize-none"
              placeholder="Share any additional details about your ritual..."
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading.completeRitual || !selectedRitual}
              className={`px-6 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:opacity-90 transition-opacity ${
                (isLoading.completeRitual || !selectedRitual) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading.completeRitual ? 'Completing...' : 'Complete Ritual'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">About Rituals</h3>
          <p className="text-gray-400 text-sm">
            Rituals are meaningful actions that contribute to the preservation of digital legacies. 
            Each type of ritual affects different aspects of your vault:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-gray-400">
            <li>• Meditation increases your Longevity Score</li>
            <li>• Tree Planting enhances your Carbon Offset</li>
            <li>• Story Sharing strengthens the Memorial</li>
            <li>• Charitable Giving grows the Ritual Value</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 