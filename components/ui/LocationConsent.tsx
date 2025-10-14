import React from 'react';

interface LocationConsentProps {
  onAccept: () => void;
  onDismiss: () => void;
}

const LocationConsent: React.FC<LocationConsentProps> = ({ onAccept, onDismiss }) => {
  return (
    <div className="fixed bottom-16 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto z-[60] max-w-xl">
      <div className="rounded-xl border border-white/20 dark:border-white/10 bg-white/90 dark:bg-gray-900/80 backdrop-blur shadow-xl p-4 flex items-start gap-3">
        <div className="mt-1 text-blue-600 dark:text-blue-300">
          <ion-icon name="locate-outline" class="text-2xl"></ion-icon>
        </div>
        <div className="flex-1 text-sm text-gray-800 dark:text-gray-200">
          To personalize your feed, we can use your current city. This helps show nearby tutors or students. You can change this later in your profile.
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onDismiss} className="px-3 py-1.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm">Not now</button>
          <button onClick={onAccept} className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm">Use my location</button>
        </div>
      </div>
    </div>
  );
};

export default LocationConsent;
