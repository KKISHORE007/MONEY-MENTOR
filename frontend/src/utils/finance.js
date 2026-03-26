/**
 * Shared financial calculation utilities
 */

export const calculateHealthScore = (data) => {
  const monthly_income = Number(data.monthly_income) || 0;
  const monthly_expenses = Number(data.monthly_expenses) || 0;
  const current_savings = Number(data.current_savings) || 0;
  const existing_loans = Number(data.existing_loans) || 0;

  // 1. Savings Rate Score (Max 25)
  const savings = monthly_income - monthly_expenses;
  const savingsRate = monthly_income > 0 ? (savings / monthly_income) * 100 : 0;
  const savingsScore = Math.max(0, Math.min(25, (savingsRate / 20) * 25));

  // 2. Emergency Fund Score (Max 25)
  const targetFund = monthly_expenses * 6;
  const fundScore = targetFund > 0 ? Math.max(0, Math.min(25, (current_savings / targetFund) * 25)) : (current_savings > 0 ? 25 : 0);

  // 3. Debt Level Score (Max 25)
  const annualIncome = monthly_income * 12;
  const dti = annualIncome > 0 ? (existing_loans / annualIncome) * 100 : (existing_loans > 0 ? 100 : 0);
  const debtScore = Math.max(0, Math.min(25, 25 - (dti / 4)));

  // 4. Expense Ratio Score (Max 25)
  const expenseRatio = monthly_income > 0 ? (monthly_expenses / monthly_income) * 100 : 100;
  const expenseScore = Math.max(0, Math.min(25, 25 - ((expenseRatio - 40) / 2)));

  const totalScore = Math.round(savingsScore + fundScore + debtScore + expenseScore);

  return {
    totalScore,
    savingsRate,
    dti,
    expenseRatio,
    emergencyFundRatio: targetFund > 0 ? (current_savings / targetFund) * 100 : 100
  };
};
