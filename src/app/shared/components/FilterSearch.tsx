"use client";

import { TextField } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

interface FilterSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function FilterSearch({
  value,
  onChange,
  placeholder = "Pesquisar..."
}: FilterSearchProps) {
  return (
    <TextField
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{ flex: 1, minWidth: 250 }}
      InputProps={{
        startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
      }}
    />
  );
}
