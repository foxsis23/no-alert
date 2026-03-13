import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
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

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" theme="dark" richColors />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
