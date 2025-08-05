import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CalendarIcon, TrophyIcon, UsersIcon } from '@heroicons/react/24/outline';

const ContestsGrid = ({ contests }) => {
  if (!contests || contests.length === 0) return null;

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Tất cả cuộc thi</h2>
          <p className="text-xl text-muted-foreground">Khám phá các cuộc thi khác</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {contests.map((contest) => (
            <Card key={contest._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative">
                <img
                  src={contest.thumbnail || "/img/contest-bg.jpg"}
                  alt={contest.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={contest.status === 'active' ? 'default' : 'secondary'}>
                    {contest.status}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg">{contest.name}</CardTitle>
                <CardDescription>{contest.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Mã: {contest.code}</span>
                  </div>
                  {contest.roundCount && (
                    <div className="flex items-center gap-2">
                      <TrophyIcon className="h-4 w-4" />
                      <span>{contest.roundCount} vòng thi</span>
                    </div>
                  )}
                  {contest.divisions?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4" />
                      <span>{contest.divisions.length} bảng thi</span>
                    </div>
                  )}
                </div>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/contests/${contest.code}`}>
                    Xem chi tiết
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContestsGrid;