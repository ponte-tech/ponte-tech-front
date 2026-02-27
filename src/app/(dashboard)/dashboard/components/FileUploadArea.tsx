"use client";

import { useState, useRef, DragEvent } from "react";
import { Box, Typography, IconButton, alpha, Grid } from "@mui/material";
import { CloudUpload as CloudUploadIcon, InsertDriveFile as FileIcon, Close as CloseIcon } from "@mui/icons-material";
import { formatFileSize } from "@/app/utils/format-utils";

interface FileUploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  maxFiles?: number;
  maxSizeMb?: number;
  selectedFiles?: File[];
  onRemoveFile?: (index: number) => void;
}

export default function FileUploadArea({
  onFilesSelected,
  accept = ".pdf,.png,.jpg,.jpeg,.webp",
  multiple = true,
  disabled = false,
  maxFiles = 5,
  maxSizeMb = 5,
  selectedFiles = [],
  onRemoveFile,
}: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const processFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
      if (file.size > maxSizeMb * 1024 * 1024) return false;
      return true;
    });

    const remaining = maxFiles - selectedFiles.length;
    const filesToAdd = validFiles.slice(0, remaining);

    if (filesToAdd.length > 0) {
      onFilesSelected(filesToAdd);
    }
  };

  return (
    <Box>
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        sx={{
          border: "2px dashed",
          borderColor: isDragging ? "#8270FF" : "grey.300",
          borderRadius: 3,
          p: 4,
          textAlign: "center",
          cursor: disabled ? "default" : "pointer",
          bgcolor: isDragging ? alpha("#8270FF", 0.05) : "grey.50",
          transition: "all 0.2s ease-in-out",
          opacity: disabled ? 0.5 : 1,
          "&:hover": disabled
            ? {}
            : {
                borderColor: "#8270FF",
                bgcolor: alpha("#8270FF", 0.03),
              },
        }}
      >
        <CloudUploadIcon
          sx={{ fontSize: 48, color: isDragging ? "#8270FF" : "grey.400", mb: 1 }}
        />
        <Typography variant="body1" fontWeight={500} color="text.primary">
          Arraste arquivos aqui ou clique para selecionar
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          PDF, PNG, JPG ou WebP (max {maxSizeMb}MB cada, até {maxFiles} arquivos)
        </Typography>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          style={{ display: "none" }}
        />
      </Box>

      {selectedFiles.length > 0 && (
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          {selectedFiles.map((file, index) => (
            <Box
              key={`${file.name}-${index}`}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.5,
                bgcolor: "grey.50",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <FileIcon sx={{ color: "#8270FF" }} />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={500} noWrap>
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(file.size)}
                </Typography>
              </Box>
              {onRemoveFile && (
                <IconButton size="small" onClick={() => onRemoveFile(index)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
