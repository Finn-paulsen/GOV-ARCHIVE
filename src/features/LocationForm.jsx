import { useForm } from 'react-hook-form';
import { Button, TextField, Box } from '@mui/material';

export function LocationForm({ onSubmit, defaultValues }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField label="Name" {...register('name', { required: true })} error={!!errors.name} helperText={errors.name && 'Pflichtfeld'} />
      <TextField label="Typ" {...register('type', { required: true })} error={!!errors.type} helperText={errors.type && 'Pflichtfeld'} />
      <TextField label="Breite" type="number" {...register('lat', { required: true })} error={!!errors.lat} helperText={errors.lat && 'Pflichtfeld'} />
      <TextField label="Länge" type="number" {...register('lng', { required: true })} error={!!errors.lng} helperText={errors.lng && 'Pflichtfeld'} />
      <Button type="submit" variant="contained">Speichern</Button>
    </Box>
  );
}
