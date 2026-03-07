/**
 * EXEMPLO: Como usar react-hook-form com DateTextField e CurrencyTextField
 *
 * Este arquivo é um guia prático para refatorar formulários.
 * Todos os formulários devem seguir este padrão!
 */

'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, Grid, TextField } from '@mui/material';
import { DateTextField } from './DateTextField';
import { CurrencyTextField } from './CurrencyTextField';

// 1. Definir schema com Zod (validação)
const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  data_nascimento: z.string().refine(
    (date) => /^\d{4}-\d{2}-\d{2}$/.test(date),
    'Data deve estar no formato YYYY-MM-DD'
  ),
  valor: z.number().min(0.01, 'Valor deve ser maior que 0'),
  descricao: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function ExemploFormHookForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      data_nascimento: '',
      valor: 0,
      descricao: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log('Dados do formulário:', data);
    // data.data_nascimento já vem em YYYY-MM-DD
    // data.valor já vem como número (ex: 1234.56)
    // Enviar direto para API!
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={2}>
        {/* Campo de texto simples com Controller */}
        <Grid item xs={12}>
          <Controller
            name="nome"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Nome"
                error={!!errors.nome}
                helperText={errors.nome?.message}
              />
            )}
          />
        </Grid>

        {/* DateTextField com Controller - DD/MM/YYYY na tela */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="data_nascimento"
            control={control}
            render={({ field }) => (
              <DateTextField
                {...field}
                fullWidth
                label="Data de Nascimento"
                error={!!errors.data_nascimento}
                helperText={errors.data_nascimento?.message}
              />
            )}
          />
        </Grid>

        {/* CurrencyTextField com Controller - R$ 1.234,56 na tela */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="valor"
            control={control}
            render={({ field }) => (
              <CurrencyTextField
                {...field}
                fullWidth
                label="Valor"
                error={!!errors.valor}
                helperText={errors.valor?.message}
              />
            )}
          />
        </Grid>

        {/* Campo opcional */}
        <Grid item xs={12}>
          <Controller
            name="descricao"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Descrição (opcional)"
                multiline
                rows={3}
              />
            )}
          />
        </Grid>

        {/* Botões */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained">
              Enviar
            </Button>
            <Button type="button" variant="outlined" onClick={() => reset()}>
              Limpar
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

/**
 * RESUMO DO PADRÃO:
 *
 * ✅ SEMPRE use Controller para envolver componentes
 * ✅ SEMPRE defina schema Zod para validação
 * ✅ DateTextField: exibe DD/MM/YYYY, envia YYYY-MM-DD
 * ✅ CurrencyTextField: exibe R$ 1.234,56, envia 1234.56
 * ✅ Aceita vírgula OU ponto em entrada de moeda
 *
 * ❌ NUNCA use type="date"
 * ❌ NUNCA use type="number" para moeda
 * ❌ NUNCA use useState para formulários inteiros (use hook-form!)
 */
