import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { BeginnerPage } from './pages/BeginnerPage';
import { IntermediatePage } from './pages/IntermediatePage';
import { AdvancedPage } from './pages/AdvancedPage';
import { PracticePage } from './pages/PracticePage';
import { ProgressPage } from './pages/ProgressPage';
import { GameRunnerPage } from './pages/GameRunnerPage';

function AppLayout() {
  const location = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const isGameRoute = location.pathname === '/game';
  const hideChrome = isGameRoute || isFullscreen;

  return (
    <div className="flex flex-col min-h-screen bg-washi text-slate-800">
      {!hideChrome && <Navbar />}
      <main className={`flex-1 w-full ${hideChrome ? 'p-0 m-0' : ''}`}>
          <Routes>
            {/* Home Route */}
            <Route path="/" element={<HomePage />} />

            {/* Beginner Routes */}
            <Route path="/beginner" element={<BeginnerPage />} />
            <Route
              path="/beginner/hiragana"
              element={<PracticePage fixedCategory="hiragana" />}
            />
            <Route
              path="/beginner/katakana"
              element={<PracticePage fixedCategory="katakana" />}
            />
            <Route
              path="/beginner/numbers"
              element={<PracticePage fixedCategory="numbers" />}
            />

            {/* Intermediate Routes */}
            <Route path="/intermediate" element={<IntermediatePage />} />
            <Route path="/intermediate/:category" element={<PracticePage />} />

            {/* Advanced Routes */}
            <Route path="/advanced" element={<AdvancedPage />} />
            <Route path="/advanced/:category" element={<PracticePage />} />

            {/* Progress Route */}
            <Route path="/progress" element={<ProgressPage />} />

            {/* Runner Game Route */}
            <Route path="/game" element={<GameRunnerPage />} />

            {/* Practice Routes */}
            <Route path="/practice/skipped" element={<PracticePage />} />
            <Route path="/practice/:category" element={<PracticePage />} />
            <Route path="/practice/:category/:id" element={<PracticePage />} />

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </main>
      {!hideChrome && <Footer />}
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;

