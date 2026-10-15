import type { LevelId, PracticeMode } from '../../types/learning';

interface LevelBadgeProps {
  level: LevelId;
  size?: 'sm' | 'md';
  className?: string;
}

export const LevelBadge = ({
  level,
  size = 'md',
  className = '',
}: LevelBadgeProps) => {
  const styles: Record<LevelId, { bg: string; text: string; border: string; label: string; jp: string }> = {
    beginner: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      label: 'Beginner',
      jp: '入門',
    },
    intermediate: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      label: 'Intermediate',
      jp: '中級',
    },
    advanced: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      label: 'Advanced',
      jp: '上級',
    },
  };

  const current = styles[level];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${current.bg} ${current.text} ${current.border} ${padding} ${className}`}
    >
      <span className="opacity-75 font-normal">{current.jp}</span>
      <span>{current.label}</span>
    </span>
  );
};

interface ModeBadgeProps {
  mode: PracticeMode;
  className?: string;
}

export const ModeBadge = ({ mode, className = '' }: ModeBadgeProps) => {
  if (mode === 'trace') {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}
      >
        Trace Mode
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 ${className}`}
    >
      Free Style
    </span>
  );
};
