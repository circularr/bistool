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

// Helper function to calculate the S-curve value
const calculateSCurve = (t: number, a: number, b: number): number => {
  return 1 / (1 + Math.exp(-a * (t - b)));
};

export const calculateTrialNPV = (params: Params): number => {
  const { N, p, c_trial, r, CAC, d, T } = params;
  let NPV = 0;
  let users = N * c_trial;

  console.log('Trial Model Parameters:', params);

  for (let t = 1; t <= T; t++) {
    const revenue = users * p;
    const costs = t === 1 ? users * CAC : 0; // CAC is only applied in the first month
    const cashFlow = revenue - costs;
    const discountFactor = 1 / Math.pow(1 + d, t);
    NPV += cashFlow * discountFactor;

    users *= r; // Apply retention rate

    console.log(`Trial Month ${t}:`, { users, revenue, costs, cashFlow, NPV });
  }

  return NPV;
};

export const calculateFreemiumNPV = (params: Params): number => {
  const { N, p, a, b, r, CAC, d, g, T } = params;
  let NPV = 0;
  let totalUsers = N;
  let paidUsers = 0;

  console.log('Freemium Model Parameters:', params);

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

    console.log(`Freemium Month ${t}:`, { totalUsers, conversionRate, newPaidUsers, paidUsers, revenue, costs, cashFlow, NPV });
  }

  return NPV;
};