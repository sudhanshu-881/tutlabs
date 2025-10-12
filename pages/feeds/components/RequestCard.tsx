import React from 'react';
import type { TuitionRequest } from '../../../lib/services/requestsService';

const RequestCard: React.FC<{ req: TuitionRequest }> = ({ req }) => {
  return (
    <div className="relative rounded-2xl border border-white/15 dark:border-white/10 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] overflow-hidden transform transition-all duration-300 will-change-transform hover:-translate-y-1 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{req.subject}</h3>
        <span className="text-sm text-gray-700/80 dark:text-gray-300/90">{req.class || 'Class N/A'}</span>
      </div>
      <p className="mt-1 text-sm text-gray-700/80 dark:text-gray-300/90">{req.location || 'Location N/A'} · {req.pincode}</p>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{req.timing || 'Timing flexible'}</p>
      {req.details && <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{req.details}</p>}
      <div className="mt-4 flex justify-end">
        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm">Express Interest</button>
      </div>
    </div>
  );
};

export default RequestCard;
