import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, MapPin, Globe, Mail, Phone, ExternalLink } from 'lucide-react';

const DetailCard = ({ 
  title, 
  description, 
  children, 
  className = '',
  actions = [],
  icon: Icon,
  badge,
  ...props 
}) => {
  return (
    <Card className={className} {...props}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              {Icon && <Icon className="h-5 w-5" />}
              <CardTitle className="text-lg">{title}</CardTitle>
              {badge && (
                <Badge variant={badge.variant || 'default'}>
                  {badge.text}
                </Badge>
              )}
            </div>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          {actions.length > 0 && (
            <div className="flex space-x-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={action.onClick}
                  className={action.className}
                >
                  {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

const DetailField = ({ 
  label, 
  value, 
  type = 'text',
  icon: Icon,
  className = '',
  emptyText = '-'
}) => {
  const renderValue = () => {
    if (!value) return emptyText;
    
    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString('vi-VN');
      case 'datetime':
        return new Date(value).toLocaleString('vi-VN');
      case 'email':
        return (
          <a 
            href={`mailto:${value}`} 
            className="text-primary hover:underline flex items-center"
          >
            <Mail className="h-4 w-4 mr-1" />
            {value}
          </a>
        );
      case 'phone':
        return (
          <a 
            href={`tel:${value}`} 
            className="text-primary hover:underline flex items-center"
          >
            <Phone className="h-4 w-4 mr-1" />
            {value}
          </a>
        );
      case 'url':
        return (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            {value}
          </a>
        );
      case 'badge':
        return <Badge variant="outline">{value}</Badge>;
      case 'tags':
        return Array.isArray(value) ? (
          <div className="flex flex-wrap gap-1">
            {value.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        ) : value;
      case 'boolean':
        return (
          <Badge variant={value ? 'default' : 'secondary'}>
            {value ? 'Có' : 'Không'}
          </Badge>
        );
      case 'status':
        return (
          <Badge variant={value === 'active' ? 'default' : 'secondary'}>
            {value}
          </Badge>
        );
      default:
        return value;
    }
  };

  return (
    <div className={`flex justify-between py-2 border-b border-border/40 last:border-0 ${className}`}>
      <div className="flex items-center text-sm font-medium text-muted-foreground">
        {Icon && <Icon className="h-4 w-4 mr-2" />}
        {label}
      </div>
      <div className="text-sm font-medium text-right max-w-[60%]">
        {renderValue()}
      </div>
    </div>
  );
};

DetailCard.Field = DetailField;

export default DetailCard;