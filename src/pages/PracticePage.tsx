import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { getCategoryMeta, getItemsByCategory, allLearningItems } from '../data';
import type { CategoryId, CategoryMetadata } from '../types/learning';
import { PracticeScreen } from '../components/practice/PracticeScreen';
import { getSkippedLearningItems } from '../utils/progression';

interface PracticePageProps {
  fixedCategory?: CategoryId;
}

export const PracticePage = ({ fixedCategory }: PracticePageProps) => {
  const { category: paramCategory, id: itemId } = useParams<{ category?: string; id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isSkippedMode =
    location.pathname.includes('/practice/skipped') || paramCategory === 'skipped';

  // Handle Practice Skipped Items route
  if (isSkippedMode) {
    const skippedItems = getSkippedLearningItems(allLearningItems);
    if (skippedItems.length === 0) {
      return (
        <div className="max-w-xl mx-auto px-4 py-16 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-xs">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Skipped Items</h2>
          <p className="text-slate-600 mb-6 text-sm">
            All your attempted items have been mastered or none have been skipped yet!
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/progress')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm cursor-pointer transition-all shadow-xs"
            >
              View Progress
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer transition-all"
            >
              Home
            </button>
          </div>
        </div>
      );
    }

    const skippedMeta: CategoryMetadata = {
      id: 'hiragana',
      title: 'Practice Skipped Items',
      japaneseTitle: '復習・保留項目',
      description: 'Practice items you previously skipped and master them with 75+ points.',
      level: skippedItems[0]?.level || 'intermediate',
      allowedModes: ['trace', 'free'],
      iconName: 'Bookmark',
      itemCount: skippedItems.length,
      progressPercent: 0,
    };

    return (
      <PracticeScreen
        items={skippedItems}
        initialItemId={itemId}
        categoryMeta={skippedMeta}
        onBack={() => navigate('/progress')}
        backLabel="Back to Progress"
      />
    );
  }

  // Determine category from props, params, or pathname
  let categoryId: CategoryId = (fixedCategory || paramCategory) as CategoryId;

  if (!categoryId) {
    if (location.pathname.includes('/beginner/hiragana')) categoryId = 'hiragana';
    else if (location.pathname.includes('/beginner/katakana')) categoryId = 'katakana';
    else if (location.pathname.includes('/beginner/numbers')) categoryId = 'numbers';
  }

  const categoryMeta = categoryId ? getCategoryMeta(categoryId) : undefined;
  const items = categoryId ? getItemsByCategory(categoryId) : [];

  if (!categoryMeta || items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Category Not Found</h2>
        <p className="text-slate-500 mb-6">
          The requested practice category could not be resolved.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-rose-600 text-white font-semibold cursor-pointer"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const handleBack = () => {
    if (categoryMeta.level === 'beginner') {
      navigate('/beginner');
    } else if (categoryMeta.level === 'intermediate') {
      navigate('/intermediate');
    } else {
      navigate('/advanced');
    }
  };

  const backLabel = `Back to ${
    categoryMeta.level.charAt(0).toUpperCase() + categoryMeta.level.slice(1)
  } Dashboard`;

  return (
    <PracticeScreen
      items={items}
      initialItemId={itemId}
      categoryMeta={categoryMeta}
      onBack={handleBack}
      backLabel={backLabel}
    />
  );
};
