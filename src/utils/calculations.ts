export interface Params {
  N: number;  // Initial number of users
  p: number;  // Price of the premium version
  c_trial: number;  // Conversion rate for trial (equivalent to 'c' in the paper)
  a: number;  // Steepness of S-curve for freemium
  b: number;  // Inflection point of S-curve for freemium
  r: number;  // Retention rate
  CAC: number;  // Customer Acquisition Cost
  d: number;  // Discount rate
  g: number;  // Network growth rate (for freemium)
  T: number;  // Total time periods
}

export interface MonthlyData {
  month: number;
  trialNPV: number;
  freemiumNPV: number;
  trialMAU: number;
  freemiumMAU: number;
}

// S-curve function for freemium conversion
const sCurve = (t: number, a: number, b: number): number => {
  return 1 / (1 + Math.exp(-a * (t - b)));
};

export const calculateTrialNPV = (params: Params): number => {
  const { N, p, c_trial, r, CAC, d, T } = params;
  let NPV = 0;
  let payingUsers = 0;

  for (let t = 1; t <= T; t++) {
    const newTrialUsers = N;
    const newPayingUsers = newTrialUsers * c_trial;
    payingUsers = (payingUsers * r) + newPayingUsers;
    
    const revenue = payingUsers * p;
    const costs = newPayingUsers * CAC;
    const cashFlow = revenue - costs;
    const discountFactor = Math.pow(1 + d, -t);
    NPV += cashFlow * discountFactor;
  }

  return NPV;
};

export const calculateFreemiumNPV = (params: Params): number => {
  const { N, p, a, b, r, CAC, d, g, T } = params;
  let NPV = 0;
  let totalUsers = N;

  for (let t = 1; t <= T; t++) {
    // Current conversion rate
    const c_t = sCurve(t, a, b);
    
    // Users who convert and are retained
    const payingUsers = totalUsers * c_t * Math.pow(r, t - 1);
    
    // Revenue
    const revenue = payingUsers * p;
    
    // New conversions this period
    const newConversions = t === 1 ? payingUsers : totalUsers * (sCurve(t, a, b) - sCurve(t - 1, a, b));
    
    // Costs (CAC applied to new conversions)
    const costs = newConversions * CAC;
    
    // Cash flow
    const cashFlow = revenue - costs;
    
    // Discount factor
    const discountFactor = Math.pow(1 + d, -t);
    
    // NPV for this period
    NPV += cashFlow * discountFactor;
    
    // Update total users for next period
    totalUsers *= (1 + g);
  }

  return NPV;
};

export const calculateMonthlyData = (params: Params): MonthlyData[] => {
  const monthlyData: MonthlyData[] = [];
  let trialNPV = 0;
  let freemiumNPV = 0;
  let trialPayingUsers = 0;
  let freemiumUsers = params.N;

  for (let t = 1; t <= params.T; t++) {
    // Trial calculations
    const newTrialUsers = params.N;  // Assume constant new trials each month
    const newPayingUsers = newTrialUsers * params.c_trial;
    trialPayingUsers = (trialPayingUsers * params.r) + newPayingUsers;
    
    const trialRevenue = trialPayingUsers * params.p;
    const trialCosts = newPayingUsers * params.CAC;
    const trialCashFlow = trialRevenue - trialCosts;
    trialNPV += trialCashFlow * Math.pow(1 + params.d, -t);

    // Freemium calculations
    const freemiumConversionRate = sCurve(t, params.a, params.b);
    const freemiumPayingUsers = freemiumUsers * freemiumConversionRate * Math.pow(params.r, t - 1);
    const freemiumRevenue = freemiumPayingUsers * params.p;
    const newFreemiumConversions = t === 1 ? freemiumPayingUsers : freemiumUsers * (sCurve(t, params.a, params.b) - sCurve(t - 1, params.a, params.b));
    const freemiumCosts = newFreemiumConversions * params.CAC;
    const freemiumCashFlow = freemiumRevenue - freemiumCosts;
    freemiumNPV += freemiumCashFlow * Math.pow(1 + params.d, -t);

    monthlyData.push({
      month: t,
      trialNPV,
      freemiumNPV,
      trialMAU: trialPayingUsers,
      freemiumMAU: freemiumUsers,
    });

    // Update user numbers for next month
    freemiumUsers *= (1 + params.g);
  }

  return monthlyData;
};