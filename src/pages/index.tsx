import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InputForm from '../components/InputForm';
import ResultsDisplay from '../components/ResultsDisplay';
import AdoptionCurveDrawer from '../components/AdoptionCurveDrawer';
import { calculateMonthlyData } from '../utils/calculations';

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
  const [showDescription, setShowDescription] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showAdoptionCurve, setShowAdoptionCurve] = useState(false);

  const results = useMemo(() => {
    const monthlyData = calculateMonthlyData(params);
    if (monthlyData.length === 0) return null;
    const lastMonth = monthlyData[monthlyData.length - 1];
    let breakEvenMonth = null;
    for (let i = 0; i < monthlyData.length; i++) {
      if (monthlyData[i].freemiumNPV >= monthlyData[i].trialNPV) {
        breakEvenMonth = i + 1;
        break;
      }
    }
    return {
      trialNPV: lastMonth.trialNPV,
      freemiumNPV: lastMonth.freemiumNPV,
      breakEvenMonth,
      monthlyData,
    };
  }, [params]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleParamChange = useCallback((newParams: typeof params) => {
    setParams(newParams);
  }, []);

  const resetAll = useCallback(() => {
    setParams(initialParams);
  }, [initialParams]);

  const toggleAdoptionCurve = useCallback(() => {
    setShowAdoptionCurve(prev => !prev);
  }, []);

  const renderKeyParameters = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Key Parameters</h2>
        <button
          onClick={resetAll}
          className="text-gray-600 hover:text-red-600 transition-colors duration-300"
          title="Reset All Parameters"
        >
          Reset
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trial Conversion Rate</label>
          <input
            type="number"
            value={(params.c_trial * 100).toFixed(2)}
            onChange={(e) => handleParamChange({ ...params, c_trial: parseFloat(e.target.value) / 100 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            step="0.01"
            min="0"
            max="100"
          />
        </div>
        <div>
          <button
            onClick={toggleAdoptionCurve}
            className="w-full h-full bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
          >
            Adjust Adoption Curve
          </button>
        </div>
      </div>
    </div>
  );

  const renderMobileView = () => (
    <div className="min-h-screen bg-gray-100 p-4">
      {renderKeyParameters()}
      <ResultsDisplay results={results} T={params.T} />
      
      <InputForm
        initialParams={params}
        onParamChange={handleParamChange}
      />

      <AnimatePresence>
        {showAdoptionCurve && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
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
          <div>
            {renderKeyParameters()}
            <ResultsDisplay results={results} T={params.T} />
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">All Parameters</h2>
            <InputForm
              initialParams={params}
              onParamChange={handleParamChange}
            />
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
            <p className="text-blue-100 text-lg sm:text-xl italic">
              Model Comparison Tool
            </p>
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="mt-4 text-white flex items-center"
            >
              {showDescription ? "Hide Description" : "Show Description"}
            </button>
          </div>
          <AnimatePresence>
            {showDescription && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-100 p-6 overflow-hidden"
              >
                <p className="text-sm text-gray-600">
                  This model compares Free Trial and Freemium strategies by calculating Net Present Value (NPV) over time. Both models use common inputs like initial users, price, and retention rate. The Free Trial model assumes a constant influx of new users with a fixed conversion rate, while the Freemium model uses an S-curve for gradual conversion and includes a network growth factor. The model accounts for Customer Acquisition Costs and applies a discount rate to future earnings, providing insights into long-term profitability.{' '}
                  <a
                    href="https://github.com/circularr/bistool/blob/main/src/pages/data/prompt.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Read more
                  </a>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8">
          {isMobile ? renderMobileView() : renderDesktopView()}
        </div>

        <footer className="mt-12 text-center text-gray-600">
          {/* ... (keep existing footer content) ... */}
        </footer>
      </main>
    </div>
  );
};

export default HomePage;