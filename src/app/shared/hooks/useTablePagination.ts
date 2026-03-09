import { useState } from "react";

export interface TablePaginationState {
  page: number;
  rowsPerPage: number;
  totalItems: number;
}

export interface TablePaginationHandlers {
  handleChangePage: (event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setTotalItems: (total: number) => void;
  resetPage: () => void;
}

export function useTablePagination(
  initialRowsPerPage: number = 10
): [TablePaginationState, TablePaginationHandlers] {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [totalItems, setTotalItems] = useState(0);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const resetPage = () => {
    setPage(0);
  };

  return [
    { page, rowsPerPage, totalItems },
    { handleChangePage, handleChangeRowsPerPage, setTotalItems, resetPage },
  ];
}
