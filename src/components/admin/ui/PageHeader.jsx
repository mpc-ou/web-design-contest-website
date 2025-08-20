import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PageHeader = ({
  title,
  description,
  actions = [],
  badge,
  children,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {badge && (
            <Badge variant={badge.variant || 'default'}>
              {badge.text}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
        {children}
      </div>
      
      {actions.length > 0 && (
        <div className="flex items-center space-x-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              size={action.size || 'default'}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon && <action.icon className="h-4 w-4 mr-2" />}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PageHeader;