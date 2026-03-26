-- Profiles Table Schema
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT,
  age INTEGER,
  monthly_income DECIMAL(12, 2) DEFAULT 0,
  monthly_expenses DECIMAL(12, 2) DEFAULT 0,
  current_savings DECIMAL(12, 2) DEFAULT 0,
  existing_loans DECIMAL(12, 2) DEFAULT 0,
  risk_appetite TEXT CHECK (risk_appetite IN ('Low', 'Medium', 'High')),
  financial_goals TEXT[] -- Array of goals
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);
