import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import About from '@/components/About';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import QuizContainer from '@/components/quiz/QuizContainer'; // Added import for QuizContainer

// Placeholder for a HomePage component or direct rendering
const HomePage = () => (
  <>
    <Hero />
    <About />
    <Services />
    <Testimonials />
    <Contact />
  </>
);

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quiz" element={<QuizContainer />} /> {/* Added route for the quiz */}
          {/* Add other routes here as pages are created */}
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;