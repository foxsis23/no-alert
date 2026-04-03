import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useSessionStore } from './store/sessionStore';
import { useQuizStore } from './store/quizStore';
import { fetchMe } from './lib/api';
import { LandingPage } from './pages/Landing/LandingPage';
import { QuizPage } from './pages/Quiz/QuizPage';
import { ResultsPage } from './pages/Results/ResultsPage';
import { CheckoutPage } from './pages/Checkout/CheckoutPage';
import { ThankYouPage } from './pages/ThankYou/ThankYouPage';
import { CoursePage } from './pages/Course/CoursePage';
import { CourseBasicPage } from './pages/Course/CourseBasicPage';
import { SupportPage } from './pages/Support/SupportPage';
import { SessionPage } from './pages/Support/SessionPage';
import { PanicAudioPage } from './pages/Support/PanicAudioPage';
import { TermsPage } from './pages/Legal/TermsPage';
import { PrivacyPage } from './pages/Legal/PrivacyPage';
import { OfferPage } from './pages/Legal/OfferPage';
import { DisclaimerPage } from './pages/Legal/DisclaimerPage';
import { AccessPage } from './pages/Access/AccessPage';
import { MyMaterialsPage } from './pages/MyMaterials/MyMaterialsPage';
import { AdminPage } from './pages/Admin/AdminPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppInit({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const sessionToken = useSessionStore((s) => s.sessionToken);
  const clearSession = useSessionStore((s) => s.clearSession);
  const setProductIds = useQuizStore((s) => s.setProductIds);

  useEffect(() => {
    if (!sessionToken) { setInitialized(true); return; }
    fetchMe(sessionToken)
      .then((ids) => setProductIds(ids))
      .catch(() => clearSession())
      .finally(() => setInitialized(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f5a623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" theme="dark" richColors />
        <AppInit>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/test" element={<QuizPage />} />
          <Route path="/result" element={<ResultsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/course/basic" element={<CourseBasicPage />} />
          <Route path="/course/:productId" element={<CoursePage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/support/session/panic_wave" element={<PanicAudioPage />} />
          <Route path="/support/session/:type" element={<SessionPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/offer" element={<OfferPage />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          <Route path="/access/:token" element={<AccessPage />} />
          <Route path="/my-materials" element={<MyMaterialsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AppInit>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
