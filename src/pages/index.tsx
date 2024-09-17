import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InputForm from '../components/InputForm';
import ResultsDisplay from '../components/ResultsDisplay';
import AdoptionCurveDrawer from '../components/AdoptionCurveDrawer';
import { calculateMonthlyData, MonthlyData } from '../utils/calculations';
import { useRouter } from 'next/router';

const HomePage: React.FC = () => {
  const initialParams = {
    N: 10000,
    p: 10,
    c_trial: 0.1,
    a: 1,
    b: 6,
    r: 0.95,
    CAC: 5,
    d: 0.1,
    g: 0.05,
    T: 12,
  };

  const [params, setParams] = useState(initialParams);
  const [results, setResults] = useState<{
    trialNPV: number;
    freemiumNPV: number;
    breakEvenMonth: number | null;
    monthlyData: MonthlyData[];
  } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showInputs, setShowInputs] = useState(false);
  const [showAdoptionCurve, setShowAdoptionCurve] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const calculateResults = useCallback((currentParams: typeof params) => {
    const monthlyData = calculateMonthlyData(currentParams);
    const lastMonth = monthlyData[monthlyData.length - 1];

    let breakEvenMonth = null;
    for (let i = 0; i < monthlyData.length; i++) {
      if (monthlyData[i].freemiumNPV >= monthlyData[i].trialNPV) {
        breakEvenMonth = i + 1;
        break;
      }
    }

    setResults({
      trialNPV: lastMonth.trialNPV,
      freemiumNPV: lastMonth.freemiumNPV,
      breakEvenMonth,
      monthlyData,
    });
  }, []);

  useEffect(() => {
    calculateResults(params);
  }, [params, calculateResults]);

  const handleParamChange = (newParams: typeof params) => {
    setParams(newParams);
    calculateResults(newParams);
  };

  const resetAll = () => {
    router.reload();
  };

  const toggleAdoptionCurve = () => {
    setShowAdoptionCurve(prev => !prev);
  };

  const toggleInputs = () => {
    setShowInputs(prev => !prev);
  };

  const renderMobileView = () => (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">Free Trial vs Freemium</h1>
      
      <AnimatePresence>
        {!showInputs && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ResultsDisplay results={results} T={params.T} />
            <button
              onClick={toggleInputs}
              className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition duration-300"
            >
              Adjust Parameters
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInputs && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <InputForm
              initialParams={params}
              onParamChange={handleParamChange}
              onReset={resetAll}
              onAdoptionCurveToggle={toggleAdoptionCurve}
            />
            <button
              onClick={toggleInputs}
              className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition duration-300"
            >
              Show Results
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdoptionCurve && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg p-4 w-full max-w-md">
              <AdoptionCurveDrawer
                onChange={(newParams) => handleParamChange({ ...params, ...newParams })}
                initialA={params.a}
                initialB={params.b}
                N={params.N}
                T={params.T}
              />
              <button
                onClick={toggleAdoptionCurve}
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition duration-300"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderDesktopView = () => (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Input Parameters</h2>
            <InputForm
              initialParams={params}
              onParamChange={handleParamChange}
              onReset={resetAll}
              onAdoptionCurveToggle={toggleAdoptionCurve}
            />
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Results</h2>
            <ResultsDisplay results={results} T={params.T} />
          </div>
        </div>
      </div>
      {showAdoptionCurve && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <AdoptionCurveDrawer
              onChange={(newParams) => handleParamChange({ ...params, ...newParams })}
              initialA={params.a}
              initialB={params.b}
              N={params.N}
              T={params.T}
            />
            <button
              onClick={toggleAdoptionCurve}
              className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Free Trial vs Freemium
            </h1>
            <p className="text-blue-100 text-lg sm:text-xl">
              Model Comparison Tool
            </p>
          </div>
        </div>

        <div className="mt-8">
          {isMobile ? renderMobileView() : renderDesktopView()}
        </div>

        <footer className="mt-12 text-center text-gray-600">
          <p className="mb-4">
            Created by Claude, Omni, Cursor, and Perplexity | Contributor: Paul Harwood
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 mb-4">
            <a
              href="https://github.com/circularr/bistool"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-gray-800 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/paul-harwood-2aa535228/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default HomePage;