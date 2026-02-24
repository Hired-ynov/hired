export interface PaginationOptions {
  limit?: number;
  page?: number;
}

export interface PaginationResult<T> {
  data: T[];
  hasNext: boolean;
  hasPrevious: boolean;
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export interface SortOptions {
  field: string;
  order: 'ASC' | 'DESC';
}
