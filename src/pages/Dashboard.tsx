import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, BarChart3, Brain } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SummaryCards from '@/components/budget/SummaryCards';
import BudgetTable from '@/components/budget/BudgetTable';
import BudgetChart from '@/components/budget/BudgetChart';
import AiInsights from '@/components/budget/AiInsights';
import { CsvImport } from '@/components/budget/CsvImport';
import DepartmentSelector from '@/components/budget/DepartmentSelector';

interface BudgetItem {
  id: string;
  category: string;
  amount: number;
}

interface BudgetSummary {
  totalBudget: number;
  largestCategory: {
    category: string;
    amount: number;
  } | null;
  yearOverYearChange: number;
}

const Dashboard = () => {
  const [department, setDepartment] = useState('');
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const fetchBudgetData = async () => {
    if (!department) {
      toast({
        variant: "destructive",
        title: t('errors.invalidData'),
        description: t('dashboard.selectDepartment'),
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('get-budget', {
        body: { department },
      });

      if (error) throw error;

      // Normalize data to match BudgetChart & BudgetTable expectations
      const normalizedData: BudgetItem[] =
        (data || []).map((item: any) => ({
          id: item.id,
          category: item.account_budget_a,
          amount: Number(item.used_amt),
        }));

      setBudgetData(normalizedData);
      setSummary(data?.summary || null);

      toast({
        title: t('common.success'),
        description: t('dashboard.dataLoaded', {
          count: normalizedData.length,
          department,
        }),
      });

      console.log("✅ Normalized budgetData:", normalizedData);
    } catch (error) {
      console.error('❌ Error fetching budget data:', error);
      toast({
        variant: "destructive",
        title: t('errors.fetchFailed'),
        description: t('errors.tryAgain'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('dashboard.title')}
          </h1>
          <p className="text-muted-foreground">{t('nav.welcome')}, {user.email}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="mb-8">
          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                {t('dashboard.budgetExplorer')}
              </CardTitle>
              <p className="text-muted-foreground">{t('dashboard.selectDepartment')}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <DepartmentSelector value={department} onChange={setDepartment} />
                <Button
                  onClick={fetchBudgetData}
                  disabled={loading || !department}
                  className="w-full bg-gradient-primary hover:opacity-90 shadow-md"
                  size="lg"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Search className="mr-2 h-4 w-4" />
                  {loading ? t('common.loading') : t('dashboard.analyzeData')}
                </Button>
                <CsvImport />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        {summary && <SummaryCards summary={summary} />}

        {/* Main Content */}
        {budgetData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-fade-in">
            <BudgetTable budgetData={budgetData} department={department} />
            <BudgetChart budgetData={budgetData} />
          </div>
        )}

        {/* AI Insights */}
        <AiInsights budgetData={budgetData} department={department} />

        {/* Empty State */}
        {!summary && !loading && (
          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">{t('dashboard.noDataMessage')}</h3>
              <p className="text-muted-foreground text-lg max-w-md mx-auto mb-6">
                {t('dashboard.sampleDataNote')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" size="lg" className="hover-scale">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  {t('dashboard.viewSample')}
                </Button>
                <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90">
                  <Link to="/insights">
                    <Brain className="mr-2 h-4 w-4" />
                    {t('dashboard.getInsights')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
