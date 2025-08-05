import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingCard = ({ 
  showHeader = true, 
  contentHeight = 'h-32',
  className = '' 
}) => {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </CardHeader>
      )}
      <CardContent>
        <div className={`space-y-2 ${contentHeight}`}>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingCard;