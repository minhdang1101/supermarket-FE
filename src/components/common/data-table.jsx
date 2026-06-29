import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export const Column = {};
export const Action = {};

export function DataTable({
  columns,
  data,
  actions = [],
  getRowActions,
  keyField = 'id',
  pageSize = 10,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);

  const hasActions = actions.length > 0 || typeof getRowActions === 'function';

  const getActionsForRow = (item) => {
    if (typeof getRowActions === 'function') {
      return getRowActions(item);
    }
    return actions;
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {columns.map((column) => (
                  <TableHead
                    key={String(column.key)}
                    className={column.width || ''}
                  >
                    {column.label}
                  </TableHead>
                ))}
                {hasActions && <TableHead className="w-12">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (hasActions ? 1 : 0)}
                    className="text-center py-8"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (hasActions ? 1 : 0)}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => {
                  const rowActions = getActionsForRow(item);
                  return (
                    <TableRow
                      key={String(item[keyField])}
                      className={`transition-colors hover:bg-muted/50 ${onRowClick ? 'cursor-pointer' : ''}`}
                      onClick={() => onRowClick && onRowClick(item)}
                    >
                      {columns.map((column) => (
                        <TableCell key={String(column.key)}>
                          {column.render
                            ? column.render(item[column.key], item)
                            : item[column.key]}
                        </TableCell>
                      ))}
                      {hasActions && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {rowActions.length > 0 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {rowActions.map((action, idx) => (
                                  <DropdownMenuItem
                                    key={idx}
                                    onClick={() => action.onClick(item)}
                                  >
                                    {action.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
