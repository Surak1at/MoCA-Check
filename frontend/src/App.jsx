import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Logout from './pages/Logout'; // ✅ เพิ่มไฟล์ใหม่
import Register from './pages/Register';
import AssessmentRegister from './pages/assessment/AssessmentRegister';
import DotConnectTest from './pages/assessment/DotConnectTest';
import GeometryCopyTest from './pages/assessment/GeometryCopyTest';
import ClockRotationTest from './pages/assessment/ClockRotationTest';
import NamingTest from './pages/assessment/NamingTest';
import MemoryTest from './pages/assessment/MemoryTest';
import MyResults from './pages/MyResults';
import NumberSequenceTest from './pages/assessment/NumberSequenceTest'; // ✅ เพิ่มไฟล์ใหม่
import BackwardNumberTest from './pages/assessment/BackwardNumberTest'; // ✅ เพิ่มไฟล์ใหม่
import NumberExclusionTest from './pages/assessment/NumberExclusionTest';
import NumberSubtractionTest from './pages/assessment/NumberSubtractionTest';
import DelayRecallTest from './pages/assessment/DelayedRecallTest'; // ✅ เพิ่มไฟล์ใหม่
import SentenceOrderingTest from './pages/assessment/SentenceOrderingTest';
import WordTypingTest from './pages/assessment/WordTypingTest';
import AbstractionTest from './pages/assessment/AbstractionTest';
import OrientationTest from './pages/assessment/OrientationTest'; // ✅ เพิ่มไฟล์ใหม่
import ResultPage from './pages/assessment/ResultPage';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EditProfile from './pages/EditProfile';
import { UserProvider } from './context/UserContext';
import PDF from './components/PDF/PDFPreview';

const AppContent = () => {
  const location = useLocation();

  return (
    <>
      {/* ✅ Navbar แสดงทุกหน้า */}
      <Navbar />

      {/* ✅ Page Transition */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} /> {/* ✅ เพิ่มไฟล์ใหม่ */}
          <Route path="/register" element={<Register />} />
          <Route path="/my-results" element={<MyResults />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:uid/:token" element={<VerifyEmail />} />
          <Route path="/edit-profile" element={<EditProfile />} />

          {/* ✅ Assessment Pages */}
          <Route path="/assessment/register" element={<AssessmentRegister />} />
          <Route path="/assessment/dot-connect" element={<DotConnectTest />} />
          <Route path="/assessment/geometry-copy" element={<GeometryCopyTest />} />
          <Route path="/assessment/clock-rotation" element={<ClockRotationTest />} />
          <Route path="/assessment/naming" element={<NamingTest />} />
          <Route path="/assessment/memory" element={<MemoryTest />} />
          <Route path="/assessment/number-sequence" element={<NumberSequenceTest />} /> {/* ✅ เพิ่มหน้าใหม่ */}
          <Route path="/assessment/number-backward" element={<BackwardNumberTest />} /> {/* ✅ เพิ่มหน้าใหม่ */}
          <Route path="/assessment/number-exclusion" element={<NumberExclusionTest />} />
          <Route path="/assessment/number-subtraction" element={<NumberSubtractionTest />} />
          <Route path="/assessment/delay-recall" element={<DelayRecallTest />} /> {/* ✅ เพิ่มหน้าใหม่ */}
          <Route path="/assessment/sentence-ordering" element={<SentenceOrderingTest />} />
          <Route path="/assessment/word-typing" element={<WordTypingTest />} />
          <Route path="/assessment/abstraction" element={<AbstractionTest />} />
          <Route path="/assessment/orientation" element={<OrientationTest />} /> {/* ✅ เพิ่มหน้าใหม่ */}
          <Route path="/assessment/result" element={<ResultPage />} />
          <Route path="/assessment/pdf" element={<PDF />} />
        </Routes>
      </AnimatePresence>

      {/* ✅ Footer แสดงทุกหน้า */}
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <UserProvider> {/* ✅ ครอบทุกหน้า */}
      <Router basename="/">
        <AppContent />
      </Router>
    </UserProvider>
  );
};

export default App;
