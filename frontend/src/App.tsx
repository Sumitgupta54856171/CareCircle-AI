import { useState, useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { CirclePage } from './pages/CirclePage';
import { MedicationsPage } from './pages/MedicationsPage';
import { AppLayout } from './components/navigation/AppLayout';
import type { ScreenId } from './components/navigation/Sidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { authApi, removeAuthToken, getAuthToken } from './lib/api';
import { Users, Clock, ArrowRight } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentCircle, setCurrentCircle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('circle');

  // Check auth session on mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then((data) => {
        setCurrentUser(data.user);
        setCurrentCircle(data.circle);
      })
      .catch(() => {
        removeAuthToken();
        setCurrentUser(null);
        setCurrentCircle(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAuthSuccess = (data: { user: any; circle: any }) => {
    setCurrentUser(data.user);
    setCurrentCircle(data.circle);
    setCurrentScreen('circle');
  };

  const handleLogout = () => {
    removeAuthToken();
    setCurrentUser(null);
    setCurrentCircle(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-[#0D9488] border-t-transparent" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Connecting to CareCircle AI...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated -> Show LoginPage
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4">
        <LoginPage onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  // Authenticated -> Render AppLayout with active screen
  return (
    <AppLayout
      currentScreen={currentScreen}
      onNavigate={setCurrentScreen}
      user={currentUser}
      onLogout={handleLogout}
    >
      {currentScreen === 'circle' ? (
        <CirclePage
          user={currentUser}
          circle={currentCircle}
          onCircleUpdated={setCurrentCircle}
        />
      ) : currentScreen === 'meds' ? (
        <MedicationsPage />
      ) : (
        /* Upcoming features placeholder while adhering to single-feature build order */
        <Card className="max-w-2xl mx-auto shadow-sm mt-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#0D9488]" />
                <CardTitle className="capitalize">{currentScreen} Feature</CardTitle>
              </div>
              <Badge variant="amber">Roadmap Locked</Badge>
            </div>
            <CardDescription>
              We are strictly adhering to the step-by-step roadmap: completing and verifying Feature 1 first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              The <strong>Care Circle</strong> (Feature 1) is currently active and ready for testing. Once Feature 1 is verified and approved, this screen will be enabled for the next feature.
            </p>
            <Button
              variant="outline"
              onClick={() => setCurrentScreen('circle')}
              className="cursor-pointer"
            >
              <Users className="h-4 w-4 mr-2 text-[#0D9488]" />
              Return to Care Circle
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
