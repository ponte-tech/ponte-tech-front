import { Box, TextField, alpha } from "@mui/material";
import { CalendarMonth as CalendarIcon } from "@mui/icons-material";

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
      <Box
        sx={{
          position: 'relative',
          display: 'inline-block',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #8270FF 0%, #a78bfa 100%)',
            opacity: 0.1,
            pointerEvents: 'none',
            zIndex: 0,
          },
        }}
      >
        <TextField
          label="Mês/Ano de Referência"
          type="month"
          value={mesReferencia}
          onChange={(e) => onMesReferenciaChange(e.target.value)}
          InputLabelProps={{
            shrink: true,
            sx: {
              fontWeight: 600,
              '&.Mui-focused': {
                color: '#8270FF',
              },
            },
          }}
          sx={{
            minWidth: 280,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'white',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              pl: 7,
              background: alpha('#8270FF', 0.02),
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              '&:hover': {
                boxShadow: `0 0 0 2px ${alpha('#8270FF', 0.1)}, 0 4px 12px rgba(0, 0, 0, 0.08)`,
                background: alpha('#8270FF', 0.04),
              },
              '&.Mui-focused': {
                boxShadow: `0 0 0 3px ${alpha('#8270FF', 0.2)}, 0 4px 12px rgba(130, 112, 255, 0.15)`,
                background: '#FFFFFF',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#8270FF',
                  borderWidth: 2,
                },
              },
            },
            '& input[type="month"]::-webkit-calendar-picker-indicator': {
              cursor: 'pointer',
              filter: 'invert(44%) sepia(88%) saturate(1686%) hue-rotate(228deg) brightness(100%) contrast(101%)',
              transition: 'all 0.2s ease',
              '&:hover': {
                filter: 'invert(44%) sepia(88%) saturate(1686%) hue-rotate(228deg) brightness(120%) contrast(101%)',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <CalendarIcon
                sx={{
                  position: 'absolute',
                  left: 16,
                  color: '#8270FF',
                  fontSize: 24,
                  zIndex: 1,
                }}
              />
            ),
          }}
        />
      </Box>
    </Box>
  );
}
