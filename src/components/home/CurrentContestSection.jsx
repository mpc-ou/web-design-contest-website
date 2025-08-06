import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { CalendarIcon, ClockIcon, TrophyIcon, UsersIcon } from '@heroicons/react/24/outline';

const CurrentContestSection = ({ contest }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isRegistrationOpen = (contest) => {
    if (!contest?.timeline) return false;
    const now = new Date();
    const regStart = new Date(contest.timeline.registrationStart);
    const regEnd = new Date(contest.timeline.registrationEnd);
    return now >= regStart && now <= regEnd;
  };

  if (!contest) return null;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Cuộc thi hiện tại</h2>
          <p className="text-xl text-muted-foreground">Tham gia ngay để thể hiện tài năng của bạn</p>
        </div>
        
        <Card className="max-w-4xl mx-auto overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={contest.thumbnail || "/img/contest-bg.jpg"}
                alt={contest.name}
                className="w-full h-64 md:h-full object-cover aspect-video"
              />
            </div>
            <div className="md:w-1/2 p-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {contest.timeline?.registrationEnd ? 
                    `Đăng ký đến ${formatDate(contest.timeline.registrationEnd)}` :
                    'Đang mở đăng ký'
                  }
                </Badge>
                <Badge variant={contest.status === 'active' ? 'default' : 'secondary'}>
                  {contest.status}
                </Badge>
              </div>
              
              <CardTitle className="text-2xl mb-4">{contest.name}</CardTitle>
              <CardDescription className="text-base mb-6">{contest.description}</CardDescription>
              
              <div className="space-y-3 mb-6">
                {contest.timeline && (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <ClockIcon className="h-4 w-4 text-muted-foreground" />
                      <span>Đăng ký: {formatDate(contest.timeline.registrationStart)} - {formatDate(contest.timeline.registrationEnd)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrophyIcon className="h-4 w-4 text-muted-foreground" />
                      <span>Thi đấu: {formatDate(contest.timeline.contestStart)} - {formatDate(contest.timeline.contestEnd)}</span>
                    </div>
                  </>
                )}
                {contest.roundCount && (
                  <div className="flex items-center gap-2 text-sm">
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{contest.roundCount} vòng thi</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {isRegistrationOpen(contest) ? (
                  <Button asChild>
                    <Link to={`/contests/${contest.code}/register`}>
                      Đăng ký ngay
                    </Link>
                  </Button>
                ) : (
                  <Button disabled>
                    Đã hết hạn đăng ký
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link to={`/contests/${contest.code || contest.id}`}>
                    Chi tiết cuộc thi
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default CurrentContestSection;