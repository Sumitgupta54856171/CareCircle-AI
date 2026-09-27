import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Clock, Users, ArrowRight } from 'lucide-react';

export function RoadmapPage() {
  const navigate = useNavigate();

  return (
    <Card className="max-w-2xl mx-auto shadow-sm mt-4 border-slate-200/90 dark:border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#0D9488]" />
            <CardTitle className="capitalize">CareCircle Dashboard</CardTitle>
          </div>
          <Badge variant="teal">Active</Badge>
        </div>
        <CardDescription>
          Seamless care coordination between patients, family caregivers, and clinical support.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Access your Care Circle, medication adherence schedules, personalized daily care routines, and intelligent AI Co-Pilot assistant anytime.
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
