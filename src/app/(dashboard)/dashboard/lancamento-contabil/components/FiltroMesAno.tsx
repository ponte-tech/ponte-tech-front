import { Box, TextField } from "@mui/material";

interface FiltroMesAnoProps {
  mesReferencia: string;
  onMesReferenciaChange: (value: string) => void;
}

export default function FiltroMesAno({
  mesReferencia,
  onMesReferenciaChange,
}: FiltroMesAnoProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        label="Mês/Ano de Referência"
        type="month"
        value={mesReferencia}
        onChange={(e) => onMesReferenciaChange(e.target.value)}
        InputLabelProps={{
          shrink: true,
        }}
        sx={{
          minWidth: 250,
          bgcolor: "white",
          borderRadius: 1,
        }}
      />
    </Box>
  );
}
