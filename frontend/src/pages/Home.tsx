import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { testConnection, fetchData } from '../services/api';

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const connection = await testConnection();
        const response = await fetchData();
        setData(response);
      } catch (err) {
        setError('Gagal terhubung ke server');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Selamat Datang
      </Typography>
      {data && (
        <Box mt={3}>
          <Typography variant="h6">Data dari Server:</Typography>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </Box>
      )}
    </Box>
  );
};

export default Home; 