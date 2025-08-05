import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const FormField = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  placeholder, 
  required = false,
  disabled = false,
  options = [],
  className = '',
  description,
  ...props 
}) => {
  const handleChange = (newValue) => {
    onChange?.(name, newValue);
  };

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            id={name}
            name={name}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={error ? 'border-destructive' : ''}
            {...props}
          />
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={handleChange}
            disabled={disabled}
          >
            <SelectTrigger className={error ? 'border-destructive' : ''}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              name={name}
              checked={value || false}
              onCheckedChange={handleChange}
              disabled={disabled}
            />
            <Label 
              htmlFor={name} 
              className="text-sm font-normal cursor-pointer"
            >
              {label}
            </Label>
          </div>
        );

      case 'switch':
        return (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor={name}>{label}</Label>
              {description && (
                <div className="text-sm text-muted-foreground">
                  {description}
                </div>
              )}
            </div>
            <Switch
              id={name}
              name={name}
              checked={value || false}
              onCheckedChange={handleChange}
              disabled={disabled}
            />
          </div>
        );

      case 'tags':
        return (
          <div className="space-y-2">
            <Input
              id={name}
              placeholder={placeholder || "Nhập tags, phân cách bằng dấu phẩy"}
              value={Array.isArray(value) ? value.join(', ') : value || ''}
              onChange={(e) => {
                const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                handleChange(tags);
              }}
              disabled={disabled}
              className={error ? 'border-destructive' : ''}
            />
            {Array.isArray(value) && value.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {value.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );

      case 'number':
        return (
          <Input
            id={name}
            name={name}
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={error ? 'border-destructive' : ''}
            {...props}
          />
        );

      case 'date':
      case 'datetime-local':
        return (
          <Input
            id={name}
            name={name}
            type={type}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            className={error ? 'border-destructive' : ''}
            {...props}
          />
        );

      case 'file':
        return (
          <div className="space-y-2">
            <Input
              id={name}
              name={name}
              type="file"
              onChange={(e) => handleChange(e.target.files[0])}
              disabled={disabled}
              className={error ? 'border-destructive' : ''}
              accept="image/*"
              {...props}
            />
            {value && typeof value === 'object' && (
              <div className="text-sm text-muted-foreground">
                Đã chọn: {value.name}
              </div>
            )}
            {value && typeof value === 'string' && (
              <div className="text-sm text-muted-foreground">
                Hiện tại: {value}
              </div>
            )}
          </div>
        );

      default:
        return (
          <Input
            id={name}
            name={name}
            type={type}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={error ? 'border-destructive' : ''}
            {...props}
          />
        );
    }
  };

  if (type === 'checkbox' || type === 'switch') {
    return (
      <div className={`space-y-2 ${className}`}>
        {renderField()}
        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && type !== 'switch' && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {renderField()}
      {description && type !== 'switch' && (
        <div className="text-sm text-muted-foreground">{description}</div>
      )}
      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}
    </div>
  );
};

export default FormField;