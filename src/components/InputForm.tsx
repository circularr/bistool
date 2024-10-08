import React, { useState, useEffect } from 'react';
import keyTerms from '../pages/data/keyterms.json';
import { Tooltip } from 'react-tooltip';

interface InputFormProps {
  initialParams: {
    N: number;
    p: number;
    c_trial: number;
    a: number;
    b: number;
    r: number;
    CAC: number;
    d: number;
    g: number;
    T: number;
  };
  onParamChange: (params: InputFormProps['initialParams']) => void;
}

const InputForm: React.FC<InputFormProps> = ({ initialParams, onParamChange }) => {
  const [params, setParams] = useState(initialParams);

  useEffect(() => {
    setParams(initialParams);
  }, [initialParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = parseFloat(value);
    
    // Convert percentage inputs to decimal
    if (['c_trial', 'r', 'd', 'g'].includes(name)) {
      newValue = newValue / 100;
    }
    
    const newParams = { ...params, [name]: newValue };
    setParams(newParams);
    onParamChange(newParams);
  };

  const renderInput = (key: string) => {
    const param = keyTerms.parameters.find(p => p.name === key.toUpperCase());
    if (!param || key === 'c_trial') return null;

    const value = ['r', 'd', 'g'].includes(key) 
      ? (params[key as keyof typeof params] * 100).toFixed(2)
      : params[key as keyof typeof params];

    return (
      <div key={key} className="mb-4">
        <label htmlFor={key} className="block text-sm font-medium text-gray-800 mb-1">
          {param.industryTerm} ({param.unit})
        </label>
        <div className="relative mt-1 rounded-md shadow-sm">
          <input
            type="number"
            id={key}
            name={key}
            value={value}
            onChange={handleChange}
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md text-gray-800"
            step={['r', 'd', 'g'].includes(key) ? '0.01' : '1'}
            min="0"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Tooltip id={`tooltip-${key}`} className="react-tooltip">
              <div className="text-sm">
                <p className="font-semibold mb-1">{param.industryTerm}</p>
                <p className="mb-2">{param.definition}</p>
                <p className="text-xs text-gray-700">Range: {param.inputRange}</p>
              </div>
            </Tooltip>
            <span 
              data-tooltip-id={`tooltip-${key}`}
              className="text-gray-500 hover:text-gray-700 cursor-help"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Object.keys(params).filter(key => !['a', 'b'].includes(key)).map(renderInput)}
      </div>
    </div>
  );
};

export default InputForm;