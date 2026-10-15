import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/70 py-10 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900">KanaSense</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-medium">
                College Language Expo
              </span>
            </div>
            <p className="text-sm text-slate-500 italic">
              "Learn Japanese. Listen. Write. Master."
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
            <Link to="/" className="text-slate-600 hover:text-rose-600 transition-colors">
              Home
            </Link>
            <Link to="/beginner" className="text-slate-600 hover:text-rose-600 transition-colors">
              Beginner
            </Link>
            <Link to="/intermediate" className="text-slate-600 hover:text-rose-600 transition-colors">
              Intermediate
            </Link>
            <Link to="/advanced" className="text-slate-600 hover:text-rose-600 transition-colors">
              Advanced
            </Link>
            <Link to="/progress" className="text-slate-600 hover:text-rose-600 transition-colors">
              Progress
            </Link>
          </div>

          <div className="text-xs text-slate-400 text-center md:text-right flex items-center gap-1.5">
            <span>Built for interactive Japanese writing practice</span>
            <Sparkles size={14} className="text-rose-400" />
          </div>
        </div>
      </div>
    </footer>
  );
};
