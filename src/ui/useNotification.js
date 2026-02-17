import { Snackbar, Alert } from '@mui/material';
import { useState } from 'react';

export function useNotification() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');

  const notify = (msg, sev = 'info') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  const Notification = () => (
    <Snackbar open={open} autoHideDuration={3000} onClose={() => setOpen(false)}>
      <Alert onClose={() => setOpen(false)} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );

  return { notify, Notification };
}
