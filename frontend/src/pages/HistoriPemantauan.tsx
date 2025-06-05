import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Snackbar,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  SelectChangeEvent,
  Button
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fetchFilterData, fetchONTHistory } from '../services/api';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

interface MonitoringData {
  id_olt: string;
  serial_number: string;
  customer_id: string;
  customer_name: string;
  status: string;
  attenuation: number;
  offline_cause: string;
  timestamp: string;
}

interface HistoriResponse {
  data: MonitoringData[];
}

interface FilterData {
  olt_list: string[];
  offline_causes: string[];
  latest_date: string;
}

const HistoriPemantauan: React.FC = () => {
  const [data, setData] = useState<MonitoringData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState({ open: false, message: '', severity: 'error' as 'error' | 'success' });
  const [orderBy, setOrderBy] = useState<keyof MonitoringData>('timestamp');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [filterData, setFilterData] = useState<FilterData>({ olt_list: [], offline_causes: [], latest_date: '' });
  
  // Filter states
  const [filters, setFilters] = useState({
    olt: '',
    status: '',
    offline_cause: '',
    attenuation: '',
    start: null as Date | null,
    end: null as Date | null
  });

  // Load filter data
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const response = await fetchFilterData();
        console.log('Filter data response:', response);
        setFilterData(response.data);
      } catch (error) {
        console.error('Error loading filter data:', error);
        setShowToast({
          open: true,
          message: 'Gagal memuat data filter',
          severity: 'error'
        });
      }
    };
    loadFilterData();
  }, []);

  // Load data with filters
  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      
      // Only add non-empty parameters
      if (filters.olt) params.olt = filters.olt;
      if (filters.status) params.status = filters.status;
      if (filters.offline_cause && filters.status === 'offline') {
        params.offline_cause = filters.offline_cause;
      }
      if (filters.attenuation && filters.status === 'online') {
        // Convert filter value to numeric value for API
        params.attenuation = filters.attenuation === '< -25' ? -25 : -24;
      }
      if (filters.start) params.start = format(filters.start, 'yyyy-MM-dd');
      if (filters.end) params.end = format(filters.end, 'yyyy-MM-dd');

      console.log('API params:', params);

      const response = await fetchONTHistory(params);
      console.log('API response:', response);
      
      setData(response.data || []);
      
      if (response.data?.length === 0) {
        setShowToast({
          open: true,
          message: 'Tidak ada data yang ditemukan dengan filter yang dipilih',
          severity: 'info' as 'error'
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setShowToast({
        open: true,
        message: 'Gagal memuat data pemantauan',
        severity: 'error'
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadData();
  }, [filters]);

  const handleFilterChange = (field: string) => (event: SelectChangeEvent | React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [field]: value
      };
      
      // Reset dependent filters when parent filter changes
      if (field === 'status') {
        if (value !== 'offline') {
          newFilters.offline_cause = '';
        }
        if (value !== 'online') {
          newFilters.attenuation = '';
        }
      }
      
      return newFilters;
    });
  };

  const handleDateChange = (field: 'start' | 'end') => (date: Date | null) => {
    setFilters(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      olt: '',
      status: '',
      offline_cause: '',
      attenuation: '',
      start: null,
      end: null
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'online':
        return '#4caf50'; // green
      case 'offline':
        return '#f44336'; // red
      default:
        return '#666';
    }
  };

  const getRedamanColor = (attenuation: number | null) => {
    if (attenuation === null || attenuation === undefined) return '#666';
    return attenuation > -25 ? '#4caf50' : '#f44336';
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;
  };

  const handleRequestSort = (property: keyof MonitoringData) => {
    if (orderBy === property) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(property);
      setOrder('asc');
    }
  };

  const getSortedData = () => {
    return [...data].sort((a, b) => {
      let aVal = a[orderBy];
      let bVal = b[orderBy];
      
      if (orderBy === 'attenuation') {
        const aNum = typeof aVal === 'number' ? aVal : (aVal ? Number(aVal) : 0);
        const bNum = typeof bVal === 'number' ? bVal : (bVal ? Number(bVal) : 0);
        return order === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      if (orderBy === 'timestamp') {
        const aTime = new Date(aVal as string).getTime();
        const bTime = new Date(bVal as string).getTime();
        return order === 'asc' ? aTime - bTime : bTime - aTime;
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      return 0;
    });
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Histori Pemantauan
      </Typography>

      {/* Filter Section */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>ID OLT</InputLabel>
              <Select
                value={filters.olt}
                label="ID OLT"
                onChange={handleFilterChange('olt')}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                      minWidth: 450,
                      maxWidth: 850,
                      overflowX: 'auto'
                    },
                  },
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  }
                }}
                sx={{
                  '& .MuiSelect-select': {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }
                }}
              >
                <MenuItem value="" sx={{ 
                  whiteSpace: 'nowrap',
                  display: 'block',
                  width: '100%',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  }
                }}>Semua</MenuItem>
                {filterData.olt_list.map(olt => (
                  <MenuItem 
                    key={olt} 
                    value={olt} 
                    sx={{ 
                      whiteSpace: 'nowrap',
                      display: 'block',
                      width: '100%',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      }
                    }}
                  >
                    {olt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status ONT</InputLabel>
              <Select
                value={filters.status}
                label="Status ONT"
                onChange={handleFilterChange('status')}
              >
                <MenuItem value="">Semua</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Penyebab Offline</InputLabel>
              <Select
                value={filters.offline_cause}
                label="Penyebab Offline"
                onChange={handleFilterChange('offline_cause')}
                disabled={filters.status !== 'offline'}
              >
                <MenuItem value="">Semua</MenuItem>
                {filterData.offline_causes.map(cause => (
                  <MenuItem key={cause} value={cause}>{cause}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Redaman</InputLabel>
              <Select
                value={filters.attenuation}
                label="Redaman"
                onChange={handleFilterChange('attenuation')}
                disabled={filters.status !== 'online'}
              >
                <MenuItem value="">Semua</MenuItem>
                <MenuItem value="< -25">{"< -25"}</MenuItem>
                <MenuItem value="> -25">{"> -25"}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Tanggal Mulai"
                value={filters.start}
                onChange={handleDateChange('start')}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Tanggal Selesai"
                value={filters.end}
                onChange={handleDateChange('end')}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <Button 
              variant="outlined" 
              onClick={handleResetFilters}
              sx={{ mt: 1, mr: 2, backgroundColor: 'white', color: 'black', borderColor: 'black', '&:hover': { backgroundColor: '#f0f0f0' }}}
            >
              Reset Filter
            </Button>
            <Button 
              variant="contained" 
              onClick={loadData}
              disabled={loading}
              sx={{ mt: 1, backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: '#333' }}}
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Data Summary */}
      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        Menampilkan {data.length} data
      </Typography>

      <TableContainer 
        component={Paper} 
        sx={{ 
          maxHeight: 450,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          borderRadius: 2
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {[
                { id: 'id_olt', label: 'ID OLT' },
                { id: 'serial_number', label: 'SN ONT' },
                { id: 'customer_id', label: 'ID Pelanggan' },
                { id: 'customer_name', label: 'Nama Pelanggan' },
                { id: 'status', label: 'Status' },
                { id: 'attenuation', label: 'Redaman' },
                { id: 'offline_cause', label: 'Penyebab Off' },
                { id: 'timestamp', label: 'Waktu' },
              ].map(col => (
                <TableCell
                  key={col.id}
                  sx={{
                    backgroundColor: '#f9f9f9',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    borderBottom: '2px solid #e0e0e0',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleRequestSort(col.id as keyof MonitoringData)}
                >
                  {col.label}
                  <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginLeft: 4, verticalAlign: 'middle', height: 28, justifyContent: 'center' }}>
                    {orderBy === col.id ? (
                      order === 'asc' ? (
                        <ArrowUp size={16} color="#bbb" />
                      ) : (
                        <ArrowDown size={16} color="#bbb" />
                      )
                    ) : (
                      <ArrowUpDown size={16} color="#bbb" />
                    )}
                  </span>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {getSortedData().length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  {loading ? 'Loading...' : 'Tidak ada data untuk ditampilkan'}
                </TableCell>
              </TableRow>
            ) : (
              getSortedData().map((row, index) => (
                <TableRow 
                  key={`${row.serial_number}-${row.timestamp}-${index}`}
                  sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                >
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.id_olt || '-'}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.serial_number || '-'}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.customer_id || '-'}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.customer_name || '-'}</TableCell>
                  <TableCell sx={{ color: getStatusColor(row.status), whiteSpace: 'nowrap', fontWeight: 'medium' }}>
                    {row.status || '-'}
                  </TableCell>
                  <TableCell sx={{ color: getRedamanColor(row.attenuation), whiteSpace: 'nowrap', fontWeight: 'medium' }}>
                    {row.attenuation !== null && row.attenuation !== undefined ? row.attenuation : '-'}
                  </TableCell>
                  <TableCell sx={{ minWidth: 70 }}>{row.offline_cause || '-'}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatTimestamp(row.timestamp)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Snackbar
        open={showToast.open}
        autoHideDuration={6000}
        onClose={() => setShowToast({ ...showToast, open: false })}
      >
        <Alert
          onClose={() => setShowToast({ ...showToast, open: false })}
          severity={showToast.severity}
          sx={{ width: '100%' }}
        >
          {showToast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HistoriPemantauan;