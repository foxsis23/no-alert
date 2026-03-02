import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/Landing/LandingPage';

// Stub pages — will be replaced in following tasks
function QuizPage() {
  return <div className="min-h-screen bg-[#0d0d1a] text-white flex items-center justify-center text-2xl">Quiz coming soon</div>;
}
function ResultsPage() {
  return <div className="min-h-screen bg-[#0d0d1a] text-white flex items-center justify-center text-2xl">Results coming soon</div>;
}
function CheckoutPage() {
  return <div className="min-h-screen bg-[#0d0d1a] text-white flex items-center justify-center text-2xl">Checkout coming soon</div>;
}
function ThankYouPage() {
  return <div className="min-h-screen bg-[#0d0d1a] text-white flex items-center justify-center text-2xl">Thank you!</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
