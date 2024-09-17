import { calculateTrialNPV, calculateFreemiumNPV, Params } from './calculations';

describe('Business Model Calculations', () => {
  const baseParams: Params = {
    N: 1000,
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

  test('Free Trial NPV should be positive with base parameters', () => {
    const npv = calculateTrialNPV(baseParams);
    expect(npv).toBeGreaterThan(0);
  });

  test('Freemium NPV should be positive with base parameters', () => {
    const npv = calculateFreemiumNPV(baseParams);
    expect(npv).toBeGreaterThan(0);
  });

  test('Higher price should increase NPV for both models', () => {
    const highPriceParams = { ...baseParams, p: 20 };
    const baseTrialNPV = calculateTrialNPV(baseParams);
    const highPriceTrialNPV = calculateTrialNPV(highPriceParams);
    expect(highPriceTrialNPV).toBeGreaterThan(baseTrialNPV);

    const baseFreemiumNPV = calculateFreemiumNPV(baseParams);
    const highPriceFreemiumNPV = calculateFreemiumNPV(highPriceParams);
    expect(highPriceFreemiumNPV).toBeGreaterThan(baseFreemiumNPV);
  });

  test('Higher CAC should decrease NPV for both models', () => {
    const highCACParams = { ...baseParams, CAC: 10 };
    const baseTrialNPV = calculateTrialNPV(baseParams);
    const highCACTrialNPV = calculateTrialNPV(highCACParams);
    expect(highCACTrialNPV).toBeLessThan(baseTrialNPV);

    const baseFreemiumNPV = calculateFreemiumNPV(baseParams);
    const highCACFreemiumNPV = calculateFreemiumNPV(highCACParams);
    expect(highCACFreemiumNPV).toBeLessThan(baseFreemiumNPV);
  });

  test('Higher retention rate should increase NPV for both models', () => {
    const highRetentionParams = { ...baseParams, r: 0.98 };
    const baseTrialNPV = calculateTrialNPV(baseParams);
    const highRetentionTrialNPV = calculateTrialNPV(highRetentionParams);
    expect(highRetentionTrialNPV).toBeGreaterThan(baseTrialNPV);

    const baseFreemiumNPV = calculateFreemiumNPV(baseParams);
    const highRetentionFreemiumNPV = calculateFreemiumNPV(highRetentionParams);
    expect(highRetentionFreemiumNPV).toBeGreaterThan(baseFreemiumNPV);
  });

  test('Higher discount rate should decrease NPV for both models', () => {
    const highDiscountParams = { ...baseParams, d: 0.2 };
    const baseTrialNPV = calculateTrialNPV(baseParams);
    const highDiscountTrialNPV = calculateTrialNPV(highDiscountParams);
    expect(highDiscountTrialNPV).toBeLessThan(baseTrialNPV);

    const baseFreemiumNPV = calculateFreemiumNPV(baseParams);
    const highDiscountFreemiumNPV = calculateFreemiumNPV(highDiscountParams);
    expect(highDiscountFreemiumNPV).toBeLessThan(baseFreemiumNPV);
  });

  test('Longer time horizon should increase NPV for both models', () => {
    const longerTimeParams = { ...baseParams, T: 24 };
    const baseTrialNPV = calculateTrialNPV(baseParams);
    const longerTimeTrialNPV = calculateTrialNPV(longerTimeParams);
    expect(longerTimeTrialNPV).toBeGreaterThan(baseTrialNPV);

    const baseFreemiumNPV = calculateFreemiumNPV(baseParams);
    const longerTimeFreemiumNPV = calculateFreemiumNPV(longerTimeParams);
    expect(longerTimeFreemiumNPV).toBeGreaterThan(baseFreemiumNPV);
  });

  test('Higher growth rate should increase Freemium NPV more than Trial NPV', () => {
    const highGrowthParams = { ...baseParams, g: 0.1 };
    const baseTrialNPV = calculateTrialNPV(baseParams);
    const highGrowthTrialNPV = calculateTrialNPV(highGrowthParams);
    const trialDifference = highGrowthTrialNPV - baseTrialNPV;

    const baseFreemiumNPV = calculateFreemiumNPV(baseParams);
    const highGrowthFreemiumNPV = calculateFreemiumNPV(highGrowthParams);
    const freemiumDifference = highGrowthFreemiumNPV - baseFreemiumNPV;

    expect(freemiumDifference).toBeGreaterThan(trialDifference);
  });
});