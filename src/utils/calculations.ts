export interface Params {
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
}

export interface MonthlyData {
  month: number;
  trialNPV: number;
  freemiumNPV: number;
  trialMAU: number;
  freemiumMAU: number;
}

// Helper function to calculate the S-curve value
const calculateSCurve = (t: number, a: number, b: number): number => {
  return 1 / (1 + Math.exp(-a * (t - b)));
};

export const calculateTrialNPV = (params: Params): number => {
  const { N, p, c_trial, r, CAC, d, T } = params;
  let NPV = 0;
  let users = N * c_trial;

  for (let t = 1; t <= T; t++) {
    const revenue = users * p;
    const costs = t === 1 ? users * CAC : 0; // CAC is only applied in the first month
    const cashFlow = revenue - costs;
    const discountFactor = 1 / Math.pow(1 + d, t);
    NPV += cashFlow * discountFactor;

    users *= r; // Apply retention rate
  }

  return NPV;
};

export const calculateFreemiumNPV = (params: Params): number => {
  const { N, p, a, b, r, CAC, d, g, T } = params;
  let NPV = 0;
  let totalUsers = N;
  let paidUsers = 0;

  for (let t = 1; t <= T; t++) {
    const conversionRate = calculateSCurve(t, a, b);
    const newPaidUsers = totalUsers * (conversionRate - (t > 1 ? calculateSCurve(t - 1, a, b) : 0));
    paidUsers = paidUsers * r + newPaidUsers;

    const revenue = paidUsers * p;
    const costs = newPaidUsers * CAC;
    const cashFlow = revenue - costs;
    const discountFactor = 1 / Math.pow(1 + d, t);
    NPV += cashFlow * discountFactor;

    totalUsers *= (1 + g); // Apply growth rate
  }

  return NPV;
};

export const calculateMonthlyData = (params: Params): MonthlyData[] => {
  const { N, p, c_trial, a, b, r, CAC, d, g, T } = params;
  let trialNPV = 0;
  let freemiumNPV = 0;
  let trialUsers = N * c_trial;
  let freemiumTotalUsers = N;
  let freemiumPaidUsers = 0;
  const monthlyData: MonthlyData[] = [];

  for (let t = 1; t <= T; t++) {
    // Trial calculations
    const trialRevenue = trialUsers * p;
    const trialCosts = t === 1 ? trialUsers * CAC : 0;
    const trialCashFlow = trialRevenue - trialCosts;
    const discountFactor = 1 / Math.pow(1 + d, t);
    trialNPV += trialCashFlow * discountFactor;

    // Freemium calculations
    const conversionRate = calculateSCurve(t, a, b);
    const newPaidUsers = freemiumTotalUsers * (conversionRate - (t > 1 ? calculateSCurve(t - 1, a, b) : 0));
    freemiumPaidUsers = freemiumPaidUsers * r + newPaidUsers;
    const freemiumRevenue = freemiumPaidUsers * p;
    const freemiumCosts = newPaidUsers * CAC;
    const freemiumCashFlow = freemiumRevenue - freemiumCosts;
    freemiumNPV += freemiumCashFlow * discountFactor;

    monthlyData.push({
      month: t,
      trialNPV,
      freemiumNPV,
      trialMAU: trialUsers,
      freemiumMAU: freemiumTotalUsers,
    });

    // Update for next month
    trialUsers *= r;
    freemiumTotalUsers *= (1 + g);
  }

  return monthlyData;
};