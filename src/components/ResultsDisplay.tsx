import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ResultsDisplayProps {
  results: {
    trialNPV: number;
    freemiumNPV: number;
    breakEvenMonth: number | null;
    monthlyData: { month: number; trialNPV: number; freemiumNPV: number; trialMAU: number; freemiumMAU: number }[];
  } | null;
  T: number;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, T }) => {
  const [showMAU, setShowMAU] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const formatValue = useCallback((value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  }, []);

  const formatXAxis = useCallback((value: number) => {
    if (T > 60) {
      return `${(value / 12).toFixed(0)}Y`;
    }
    return value.toString();
  }, [T]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!results) {
    return <div>Loading results...</div>;
  }

  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      color: string;
    }>;
    label?: string | number;
  }

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded shadow-lg border border-gray-200 text-xs">
          <p className="font-bold">{`${T > 60 ? 'Year' : 'Month'}: ${T > 60 ? (Number(label) / 12).toFixed(1) : label}`}</p>
          {payload.map((pld, index) => (
            <p key={index} style={{ color: pld.color }}>
              {`${pld.name}: ${formatValue(pld.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderMobileView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="text-sm font-semibold text-blue-800 mb-1">Free Trial</h3>
          <p className="text-xl font-bold text-blue-600">${formatValue(results.trialNPV)}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-md">
          <h3 className="text-sm font-semibold text-green-800 mb-1">Freemium</h3>
          <p className="text-xl font-bold text-green-600">${formatValue(results.freemiumNPV)}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-md shadow">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-700">Performance Over Time</h3>
          <button
            onClick={() => setShowMAU(!showMAU)}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition duration-300"
          >
            {showMAU ? "Show NPV" : "Show MAU"}
          </button>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={results.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tickFormatter={formatXAxis} />
              <YAxis tickFormatter={formatValue} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {showMAU ? (
                <>
                  <Line type="monotone" dataKey="trialMAU" stroke="#3b82f6" name="Free Trial MAU" />
                  <Line type="monotone" dataKey="freemiumMAU" stroke="#10b981" name="Freemium MAU" />
                </>
              ) : (
                <>
                  <Line type="monotone" dataKey="trialNPV" stroke="#3b82f6" name="Free Trial NPV" />
                  <Line type="monotone" dataKey="freemiumNPV" stroke="#10b981" name="Freemium NPV" />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderDesktopView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Free Trial Model</h3>
          <p className="text-3xl font-bold text-blue-600 mb-2">${formatValue(results.trialNPV)}</p>
          <p className="text-sm text-blue-800">
            NPV: Total value of future cash flows
          </p>
          <p className="text-xl font-semibold text-blue-800 mt-4 mb-2">
            MAU: {formatValue(results.monthlyData[results.monthlyData.length - 1]?.trialMAU || 0)}
          </p>
          <p className="text-sm text-blue-800">
            Active users at {T > 12 ? `year ${(T / 12).toFixed(1)}` : `month ${T}`}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Freemium Model</h3>
          <p className="text-3xl font-bold text-green-600 mb-2">${formatValue(results.freemiumNPV)}</p>
          <p className="text-sm text-green-800">
            NPV: Total value of future cash flows
          </p>
          <p className="text-xl font-semibold text-green-800 mt-4 mb-2">
            MAU: {formatValue(results.monthlyData[results.monthlyData.length - 1]?.freemiumMAU || 0)}
          </p>
          <p className="text-sm text-green-800">
            Active users at {T > 12 ? `year ${(T / 12).toFixed(1)}` : `month ${T}`}
          </p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-md shadow">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-700">Performance Over Time</h3>
          <button
            onClick={() => setShowMAU(!showMAU)}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition duration-300"
          >
            {showMAU ? "Show NPV" : "Show MAU"}
          </button>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={results.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tickFormatter={formatXAxis} />
              <YAxis tickFormatter={formatValue} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {showMAU ? (
                <>
                  <Line type="monotone" dataKey="trialMAU" stroke="#3b82f6" name="Free Trial MAU" />
                  <Line type="monotone" dataKey="freemiumMAU" stroke="#10b981" name="Freemium MAU" />
                </>
              ) : (
                <>
                  <Line type="monotone" dataKey="trialNPV" stroke="#3b82f6" name="Free Trial NPV" />
                  <Line type="monotone" dataKey="freemiumNPV" stroke="#10b981" name="Freemium NPV" />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  return isMobile ? renderMobileView() : renderDesktopView();
};

export default ResultsDisplay;