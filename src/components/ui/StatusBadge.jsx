import { Badge } from '@/components/ui/badge';
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const StatusBadge = ({ status, animated = false }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'success':
        return {
          variant: 'default',
          icon: CheckCircleIcon,
          text: 'Thành công',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'error':
        return {
          variant: 'destructive', 
          icon: ExclamationCircleIcon,
          text: 'Lỗi',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'loading':
        return {
          variant: 'secondary',
          icon: ClockIcon,
          text: 'Đang xử lý',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      default:
        return {
          variant: 'outline',
          icon: null,
          text: status,
          className: ''
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={`
        ${config.className}
        ${animated ? 'animate-pulse' : ''}
        flex items-center gap-1
      `}
    >
      {IconComponent && (
        <IconComponent className={`h-3 w-3 ${status === 'loading' && animated ? 'animate-spin' : ''}`} />
      )}
      {config.text}
    </Badge>
  );
};

export default StatusBadge;