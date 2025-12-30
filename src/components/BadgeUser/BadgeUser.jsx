import React, { useMemo } from 'react';
import { FiZap, FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const BadgeUser = ({ userStatus = 'FREE' }) => {
  const navigate = useNavigate();
  const isPremium = userStatus === 'PREMIUM';

  const badgeConfig = useMemo(() => {
    if (isPremium) {
      return {
        label: 'PREMIUM',
        icon: <FiStar className="text-amber-400" />,
        containerClass: 'bg-gradient-to-r from-amber-500/10 to-amber-600/10 border-amber-500/20 text-amber-700 dark:text-amber-400',
        dotClass: 'bg-amber-500'
      };
    }
    return {
      label: 'FREE',
      icon: <FiZap className="text-blue-500" />,
      containerClass: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
      dotClass: 'bg-blue-500'
    };
  }, [isPremium]);

  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-full border shadow-sm ${badgeConfig.containerClass} transition-all duration-300`}>
        <span className="flex h-2 w-2 rounded-full relative">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${badgeConfig.dotClass}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${badgeConfig.dotClass}`}></span>
        </span>
        <div className="flex items-center gap-1.5 uppercase tracking-wider">
          {badgeConfig.icon}
          {badgeConfig.label}
        </div>
      </div>

      {!isPremium && (
        <button
          onClick={() => navigate('/pricing')}
          className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline underline-offset-2 decoration-2 px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all uppercase tracking-tighter"
        >
          Upgrade Pro
        </button>
      )}
    </div>
  );
};

export default BadgeUser;
