import { Box, TextField, alpha, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { CalendarMonth as CalendarIcon, Business as BusinessIcon } from "@mui/icons-material";

interface FiltroLancamentosProps {
  mesReferencia: string;
  onMesReferenciaChange: (value: string) => void;
  empresaSelecionada?: string;
  onEmpresaChange?: (value: string) => void;
  empresas?: Array<{ nome: string }>;
}

export default function FiltroLancamentos({
  mesReferencia,
  onMesReferenciaChange,
  empresaSelecionada = "",
  onEmpresaChange,
  empresas = [],
}: FiltroLancamentosProps) {
  return (
    <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {/* Mês/Ano */}
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

      {/* Filtro por Empresa */}
      {onEmpresaChange && empresas.length > 0 && (
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
          <FormControl
            sx={{
              minWidth: 320,
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
              '& .MuiInputLabel-root': {
                fontWeight: 600,
                '&.Mui-focused': {
                  color: '#8270FF',
                },
              },
            }}
          >
            <InputLabel>Empresas</InputLabel>
            <Select
              value={empresaSelecionada}
              onChange={(e) => onEmpresaChange(e.target.value)}
              label="Empresas"
              startAdornment={
                <BusinessIcon
                  sx={{
                    position: 'absolute',
                    left: 16,
                    color: '#8270FF',
                    fontSize: 24,
                    zIndex: 1,
                    pointerEvents: 'none',
                  }}
                />
              }
            >
              <MenuItem value="">
                <em>Todas</em>
              </MenuItem>
              {empresas.map((empresa, index) => (
                <MenuItem key={index} value={empresa.nome}>
                  {empresa.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
    </Box>
  );
}
