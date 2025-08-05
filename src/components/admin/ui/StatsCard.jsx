import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const StatsCard = ({
  title,
  value,
  change,
  changeType = 'neutral', // 'positive', 'negative', 'neutral'
  icon: Icon,
  description,
  badge,
  onClick,
  loading = false,
}) => {
  const getTrendIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-4 w-4 bg-muted rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted rounded w-16 mb-2"></div>
          <div className="h-3 bg-muted rounded w-32"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {badge && (
            <Badge variant={badge.variant || 'default'} className="text-xs">
              {badge.text}
            </Badge>
          )}
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(change !== undefined || description) && (
          <div className="flex items-center space-x-2 text-xs mt-1">
            {change !== undefined && (
              <>
                {getTrendIcon()}
                <span className={getChangeColor()}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
                <span className="text-muted-foreground">so với tháng trước</span>
              </>
            )}
            {description && !change && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;