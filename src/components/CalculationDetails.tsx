import React from 'react';
import keyTerms from '../pages/data/keyterms.json';

interface CalculationDetailsProps {
  results: {
    params: {
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
    monthlyData: {
      month: number;
      monthlyTrialNPV: number;
      monthlyFreemiumNPV: number;
    }[];
  };
}

const CalculationDetails: React.FC<CalculationDetailsProps> = ({ results }) => {
  const { params, monthlyData } = results;

  const getParamName = (key: string) => {
    const param = keyTerms.parameters.find(p => p.name === key.toUpperCase());
    return param ? param.industryTerm : key;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Input Parameters:</h3>
      <ul className="list-disc pl-5">
        {Object.entries(params).map(([key, value]) => (
          <li key={key}>{`${getParamName(key)}: ${value}`}</li>
        ))}
      </ul>
      <h3 className="text-xl font-semibold">Monthly Calculations:</h3>
      <table className="w-full">
        <thead>
          <tr>
            <th>Month</th>
            <th>Trial Model Net Present Value</th>
            <th>Freemium Model Net Present Value</th>
          </tr>
        </thead>
        <tbody>
          {monthlyData.map((data) => (
            <tr key={data.month}>
              <td>{data.month}</td>
              <td>${data.monthlyTrialNPV.toFixed(2)}</td>
              <td>${data.monthlyFreemiumNPV.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CalculationDetails;