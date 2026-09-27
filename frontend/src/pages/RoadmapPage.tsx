import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Clock, Users, ArrowRight } from 'lucide-react';

export function RoadmapPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const screenName = location.pathname.replace('/', '') || 'Feature';

  return (
    <Card className="max-w-2xl mx-auto shadow-sm mt-4 border-slate-200/90 dark:border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#0D9488]" />
            <CardTitle className="capitalize">{screenName} Feature</CardTitle>
          </div>
          <Badge variant="amber">Roadmap Phase</Badge>
        </div>
        <CardDescription>
          Following our strict step-by-step roadmap: Features 1, 2, and 3 are currently complete.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This section will be activated in the next step. You can navigate between <strong>Care Circle</strong> (Feature 1), <strong>Medications</strong> (Feature 2), and <strong>AI Co-Pilot</strong> (Feature 3) anytime.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/circle')}
            className="cursor-pointer"
          >
            <Users className="h-4 w-4 mr-2 text-[#0D9488]" />
            Return to Care Circle
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
