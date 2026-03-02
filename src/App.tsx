import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/Landing/LandingPage';
import { QuizPage } from './pages/Quiz/QuizPage';
import { ResultsPage } from './pages/Results/ResultsPage';
import { CheckoutPage } from './pages/Checkout/CheckoutPage';
import { ThankYouPage } from './pages/ThankYou/ThankYouPage';
import { SupportPage } from './pages/Support/SupportPage';
import { SessionPage } from './pages/Support/SessionPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/test" element={<QuizPage />} />
        <Route path="/result" element={<ResultsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/support/session/:type" element={<SessionPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
