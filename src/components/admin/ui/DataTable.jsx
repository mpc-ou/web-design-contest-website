import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  Search,
  Filter,
  Download
} from 'lucide-react';

const DataTable = ({
  data = [],
  columns = [],
  searchable = true,
  filterable = false,
  exportable = false,
  onRowAction,
  loading = false,
  pagination = null,
  onPageChange,
  onSearch,
  onFilter,
  onExport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleFilter = (value) => {
    setSelectedFilter(value);
    onFilter?.(value === 'all' ? '' : value);
  };

  const renderCellContent = (item, column) => {
    const value = item[column.key];
    
    switch (column.type) {
      case 'badge':
        return (
          <Badge variant={column.badgeVariant?.(value) || 'default'}>
            {column.badgeText?.(value) || value}
          </Badge>
        );
      case 'date':
        if (!value) return '-';
        const date = new Date(value);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('vi-VN');
      case 'datetime':
        if (!value) return '-';
        const datetime = new Date(value);
        return isNaN(datetime.getTime()) ? 'Invalid Date' : datetime.toLocaleString('vi-VN');
      case 'custom':
        return column.render?.(value, item);
      default:
        return value || '-';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with search and filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          )}
          
          {filterable && (
            <Select value={selectedFilter} onValueChange={handleFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Lọc" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {filterable.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {exportable && (
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.title}
                </TableHead>
              ))}
              {onRowAction && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (onRowAction ? 1 : 0)} 
                  className="h-24 text-center"
                >
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (onRowAction ? 1 : 0)} 
                  className="h-24 text-center"
                >
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={item._id || index}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {renderCellContent(item, column)}
                    </TableCell>
                  ))}
                  {onRowAction && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {onRowAction.map((action) => {
                            // Handle conditional actions
                            if (action.condition && !action.condition(item)) {
                              return null;
                            }
                            
                            // Get dynamic label and icon
                            const label = typeof action.label === 'function' ? action.label(item) : action.label;
                            const IconComponent = typeof action.icon === 'function' ? action.icon(item) : action.icon;
                            
                            return (
                              <DropdownMenuItem 
                                key={action.key}
                                onClick={() => action.handler(item)}
                                className={action.destructive ? 'text-destructive' : ''}
                              >
                                {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
                                {label}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Hiển thị {((pagination.currentPage - 1) * pagination.perPage) + 1} đến{' '}
            {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} trong{' '}
            {pagination.total} kết quả
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </Button>
            <div className="text-sm">
              Trang {pagination.currentPage} / {pagination.pageCount}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.pageCount}
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;