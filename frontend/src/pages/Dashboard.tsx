import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { fetchONTList, fetchAllONTHistory, fetchData } from '../services/api';
import { Line } from 'react-chartjs-2';
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { inherits } from 'util';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ONTData {
  id_olt: string;
  customer_name: string;
  attenuation: number;
  serial_number: string;
  status: string;
  customer_id: string;
  offline_cause: string;
  timestamp: string;
}

interface MonitoringData {
  id_olt: string;
  serial_number: string;
  customer_id: string;
  status: string;
  attenuation: number;
  offline_cause: string;
  timestamp: string;
}

interface SortState {
  order: 'asc' | 'desc';
  orderBy: keyof ONTData;
}

interface Column {
  id: keyof ONTData;
  label: string;
}

interface DialogTableProps {
  open: boolean;
  onClose: () => void;
  title: string;
  data: ONTData[];
  getStatusColor: (status: string | null) => string;
  getRedamanColor: (attenuation: number) => string;
  formatTimestamp: (timestamp: string | null) => string;
}

const TABLE_COLUMNS: Column[] = [
  { id: 'serial_number', label: 'SN ONT' },
  { id: 'customer_id', label: 'ID Pelanggan' },
  { id: 'customer_name', label: 'Nama Pelanggan' },
  { id: 'status', label: 'Status' },
  { id: 'attenuation', label: 'Redaman' },
  { id: 'offline_cause', label: 'Penyebab Off' },
  { id: 'timestamp', label: 'Waktu' },
];

const DIALOG_COLUMNS: Column[] = [
  { id: 'id_olt', label: 'ID OLT' },
  { id: 'serial_number', label: 'SN ONT' },
  { id: 'customer_id', label: 'ID Pelanggan' },
  { id: 'customer_name', label: 'Nama Pelanggan' },
  { id: 'status', label: 'Status' },
  { id: 'attenuation', label: 'Redaman' },
  { id: 'offline_cause', label: 'Penyebab Off' },
  { id: 'timestamp', label: 'Waktu' },
];

const DialogTable: React.FC<DialogTableProps> = ({ 
  open, 
  onClose, 
  title, 
  data,
  getStatusColor,
  getRedamanColor,
  formatTimestamp
}) => {
  // Sort data berdasarkan ID OLT dan Serial Number
  const sortedData = [...data].sort((a, b) => {
    if (a.id_olt !== b.id_olt) {
      return a.id_olt.localeCompare(b.id_olt);
    }
    return a.serial_number.localeCompare(b.serial_number);
  });

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '60vh',
          height: '60vh',
          maxWidth: '70vw'
        }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 1.5, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        borderBottom: '1px solid #eee',
        position: 'relative'
      }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontSize: '1.1rem', 
            fontWeight: 600,
            textAlign: 'center'
          }}
        >
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
            padding: '4px',
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          <X size={16} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2 }}>
        <Box sx={{ height: '100%', overflow: 'auto' }}>
          <TableContainer 
            component={Paper} 
            sx={{ 
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              borderRadius: 1,
            }}
          >
            <Table 
              size="small" 
              sx={{ 
                '& .MuiTableCell-root': { 
                  fontSize: '0.7rem',
                  py: 0.75,  // Menambah padding vertikal
                  lineHeight: 1.2  // Menambah jarak antar baris
                },
                '& .MuiTableRow-root': {
                  height: '32px'  // Menetapkan tinggi minimum baris
                }
              }}
            >
              <TableHead>
                <TableRow sx={{ background: '#f9f9f9' }}>
                  {DIALOG_COLUMNS.map((col) => (
                    <TableCell
                      key={col.id}
                      sx={{
                        backgroundColor: '#f9f9f9',
                        color: '#333',
                        fontWeight: 'bold',
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        borderBottom: '1px solid #e0e0e0',
                        whiteSpace: col.id === 'offline_cause' ? 'normal' : 'nowrap',
                        ...(col.id === 'id_olt' && { minWidth: 190, maxWidth: 205, width: 200 }),
                        ...(col.id === 'serial_number' && { minWidth: 55, maxWidth: 75, width: 65 }),
                        ...(col.id === 'customer_id' && { minWidth: 55, maxWidth: 75, width: 65 }),
                        ...(col.id === 'customer_name' && { minWidth: 75, maxWidth: 95, width: 85 }),
                        ...(col.id === 'status' && { minWidth: 35, maxWidth: 45, width: 40 }),
                        ...(col.id === 'attenuation' && { minWidth: 20, maxWidth: 30, width: 25 }),
                        ...(col.id === 'offline_cause' && { minWidth: 45, maxWidth: 60, width: 55 }),
                        ...(col.id === 'timestamp' && { minWidth: 85, maxWidth: 100, width: 95 }),
                      }}
                      align={['status', 'attenuation', 'offline_cause', 'timestamp'].includes(col.id) ? 'center' : 'left'}
                    >
                      {col.id === 'offline_cause' ? (
                        <span>Penyebab<br />Offline</span>
                      ) : col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.map((row) => (
                  <TableRow key={`${row.id_olt}-${row.serial_number}`}>
                    <TableCell sx={{ minWidth: 75, maxWidth: 90, width: 85 }}>{row.id_olt}</TableCell>
                    <TableCell sx={{ minWidth: 55, maxWidth: 75, width: 65 }}>{row.serial_number || "Belum di polling"}</TableCell>
                    <TableCell sx={{ minWidth: 55, maxWidth: 75, width: 65 }} align="center">{row.customer_id || "Belum di polling"}</TableCell>
                    <TableCell sx={{ minWidth: 75, maxWidth: 95, width: 85 }}>{row.customer_name || "Belum di polling"}</TableCell>
                    <TableCell sx={{ color: getStatusColor(row.status), minWidth: 35, maxWidth: 45, width: 40 }} align="center">
                      {row.status || "Belum di polling"}
                    </TableCell>
                    <TableCell sx={{ color: getRedamanColor(row.attenuation), minWidth: 25, maxWidth: 35, width: 30 }} align="center">
                      {row.attenuation !== undefined ? row.attenuation : "Belum di polling"}
                    </TableCell>
                    <TableCell sx={{ minWidth: 45, maxWidth: 60, width: 55 }} align="center">{row.offline_cause || "Belum di polling"}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', minWidth: 85, maxWidth: 100, width: 95 }} align="center">{formatTimestamp(row.timestamp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState({ open: false, message: '' });
  const [data, setData] = useState<ONTData[]>([]);
  const [history, setHistory] = useState<MonitoringData[]>([]);
  const [sortStates, setSortStates] = useState<Map<string, SortState>>(new Map());
  const [expandedOLTs, setExpandedOLTs] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [dialogData, setDialogData] = useState<ONTData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchONTList();
        setData(response.data);
      } catch (error) {
        setShowToast({
          open: true,
          message: 'Gagal memuat data ONT'
        });
      }
    };
    const loadHistory = async () => {
      try {
        const response = await fetchAllONTHistory();
        setHistory(response.data);
      } catch (error) {
        // abaikan error history
      }
    };
    loadData();
    loadHistory();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetchONTList();
        
        // Update hanya status, redaman, dan penyebab offline
        setData(prevData => {
          const updatedData = [...prevData];
          
          // Gunakan map dengan serial_number sebagai kunci untuk lookup cepat
          const newDataMap = new Map<string, ONTData>(
            response.data.map((item: ONTData) => [item.serial_number, item])
          );
          
          // Perbarui hanya properti yang diinginkan, tetapi pertahankan posisi
          updatedData.forEach((item, index) => {
            const newItem = newDataMap.get(item.serial_number);
            if (newItem) {
              // Explicitly cast newItem to ONTData to satisfy TypeScript
              const typedNewItem = newItem as ONTData;
              updatedData[index] = {
                ...item, // Pertahankan properti lama
                status: typedNewItem.status, // Perbarui hanya status,
                attenuation: typedNewItem.attenuation, // redaman,
                offline_cause: typedNewItem.offline_cause, // dan penyebab offline
                timestamp: typedNewItem.timestamp, // dan timestamp
              };
            }
          });
          
          return updatedData;
        });
      } catch (error) {
        setShowToast({ open: true, message: 'Gagal memperbarui data ONT' });
      }
    }, 5000); // tiap 5 detik
  
    return () => clearInterval(interval);
  }, []);
  

  // Card summary
  const totalONT = data.length;
  const totalOLT = Array.from(new Set(data.map(d => d.id_olt))).length;
  const totalONTOffline = data.filter(d => d.status?.toLowerCase() === 'offline' && d.offline_cause === 'dying-gasp').length;
  const totalONTLOS = data.filter(d => d.status?.toLowerCase() === 'offline' && d.offline_cause !== 'dying-gasp').length;
  const totalRedamanTinggi = data.filter(d => d.attenuation < -25).length;

  // Fungsi untuk mendapatkan atau membuat state sort untuk OLT tertentu
  const getSortState = (oltId: string): SortState => {
    if (!sortStates.has(oltId)) {
      const defaultState: SortState = { order: 'asc', orderBy: 'customer_name' };
      setSortStates(prev => new Map(prev).set(oltId, defaultState));
      return defaultState;
    }
    return sortStates.get(oltId)!;
  };

  // Fungsi untuk mengubah state sort untuk OLT tertentu
  const handleRequestSort = (oltId: string, property: keyof ONTData) => {
    const currentState = getSortState(oltId);
    const isAsc = currentState.orderBy === property && currentState.order === 'asc';
    
    setSortStates(prev => {
      const newMap = new Map(prev);
      newMap.set(oltId, {
        order: isAsc ? 'desc' : 'asc',
        orderBy: property
      });
      return newMap;
    });
  };

  // Fungsi untuk mengurutkan data ONT untuk OLT tertentu
  const getSortedONTList = (oltId: string, ontList: ONTData[]): ONTData[] => {
    const sortState = getSortState(oltId);
    const { order, orderBy } = sortState;

    return [...ontList].sort((a, b) => {
      if (orderBy === 'attenuation') {
        return order === 'asc' 
          ? a[orderBy] - b[orderBy]
          : b[orderBy] - a[orderBy];
      }
      
      if (typeof a[orderBy] === 'string' && typeof b[orderBy] === 'string') {
        const compareResult = (a[orderBy] as string).localeCompare(b[orderBy] as string);
        return order === 'asc' ? compareResult : -compareResult;
      }
      
      if (a[orderBy] < b[orderBy]) {
        return order === 'asc' ? -1 : 1;
      }
      if (a[orderBy] > b[orderBy]) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Tambahkan fungsi untuk mengelompokkan data berdasarkan ID OLT
  const groupDataByOLT = (data: ONTData[]) => {
    const groupedData = new Map<string, ONTData[]>();
    
    data.forEach(item => {
      if (!groupedData.has(item.id_olt)) {
        groupedData.set(item.id_olt, []);
      }
      groupedData.get(item.id_olt)?.push(item);
    });
    
    return groupedData;
  };

  const toggleOLT = (oltId: string) => {
    setExpandedOLTs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(oltId)) {
        newSet.delete(oltId);
      } else {
        newSet.add(oltId);
      }
      return newSet;
    });
  };

  const handleCardClick = (type: string) => {
    switch (type) {
      case 'total':
        navigate('/data-ont');
        break;
      case 'offline':
        const offlineData = data.filter(d => d.status?.toLowerCase() === 'offline' && d.offline_cause === 'dying-gasp');
        setDialogOpen(true);
        setDialogTitle('ONT Offline');
        setDialogData(offlineData);
        break;
      case 'los':
        const losData = data.filter(d => d.status?.toLowerCase() === 'offline' && d.offline_cause !== 'dying-gasp');
        setDialogOpen(true);
        setDialogTitle('ONT LOS');
        setDialogData(losData);
        break;
      case 'redaman':
        const redamanData = data.filter(d => d.attenuation < -25);
        setDialogOpen(true);
        setDialogTitle('ONT Redaman Tinggi');
        setDialogData(redamanData);
        break;
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'text.primary';
    switch (status.toLowerCase()) {
      case 'online':
        return 'success.main';
      case 'offline':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };

  const getRedamanColor = (attenuation: number) => {
    if (attenuation > -25) return 'success.main';  
    return 'error.main';                           
  };

  const formatTimestamp = (timestamp: string | null) => {
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

  return (
    <Box sx={{ 
      p: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        flexShrink: 0,
        mb: 2
      }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard
      </Typography>
      {/* Card summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
      <Card 
        onClick={() => handleCardClick('total')}
        sx={{ 
          height: 60, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          p: 3, 
          borderRadius: 2, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
          border: '1px solid #eee',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: '#fafafa'
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111', mb: 1 }}>
          Total ONT
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 750, color: '#111', lineHeight: 1.2 , fontSize: 26}}>
          {totalONT} <span style={{ fontSize: 'inherit', fontWeight: 'inherit' }}>ONT</span>
        </Typography>
        <Typography variant="body2" sx={{ color: '#888'}}>
          dari {totalOLT} OLT
        </Typography>
      </Card>
    </Grid>

          <Grid item xs={12} md={3}>
      <Card 
        onClick={() => handleCardClick('offline')}
        sx={{ 
          height: 60, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          p: 3, 
          borderRadius: 2, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
          border: '1px solid #eee',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: '#fafafa'
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111', mb: 1 }}>
          ONT Offline
        </Typography>
              <Typography variant="h4" sx={{ fontWeight: 750, color: '#ff4500', lineHeight: 1.2, fontSize: 26}}>
          {totalONTOffline} <span style={{ fontSize: 'inherit', fontWeight: 'inherit'}}>ONT</span>
        </Typography>
        <Typography variant="body2" sx={{ color: '#888'}}>
          {totalONT === 0 ? '0' : ((totalONTOffline / totalONT) * 100).toFixed(1)}% dari total ONT
        </Typography>
      </Card>
    </Grid>

          <Grid item xs={12} md={3}>
            <Card 
              onClick={() => handleCardClick('los')}
              sx={{ 
                height: 60, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                p: 3, 
                borderRadius: 2, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                border: '1px solid #eee',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#fafafa'
                }
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 550, color: '#111', mb: 1 }}>
                ONT LOS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 750, color: '#FF0033 ', lineHeight: 1.2, fontSize: 26 }}>
                {totalONTLOS} <span style={{ fontSize: 'inherit', fontWeight: 'inherit'}}>ONT</span>
              </Typography>
              <Typography variant="body2" sx={{ color: '#888'}}>
                {totalONT === 0 ? '0' : ((totalONTLOS / totalONT) * 100).toFixed(1)}% dari total ONT
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
      <Card 
        onClick={() => handleCardClick('redaman')}
        sx={{ 
          height: 60, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          p: 3, 
          borderRadius: 2, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
          border: '1px solid #eee',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: '#fafafa'
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 550, color: '#111', mb: 1 }}>
          ONT Redaman Tinggi
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 750, color: '#ffa726', lineHeight: 1.2, fontSize: 26 }}>
          {totalRedamanTinggi} <span style={{ fontSize: 'inherit', fontWeight: 'inherit'}}>ONT</span>
        </Typography>
        <Typography variant="body2" sx={{ color: '#888'}}>
          {totalONT === 0 ? '0' : ((totalRedamanTinggi / totalONT) * 100).toFixed(1)}% dari total ONT
        </Typography>
      </Card>
    </Grid>
  </Grid>
      </Box>

      <Box 
        component="div"
        sx={{ 
          flexGrow: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
            '&:hover': {
              background: '#666',
            },
          },
        }}
      >
      {Array.from(groupDataByOLT(data).entries())
          .sort(([a], [b]) => a.localeCompare(b))
        .map(([oltId, ontList]) => {
          const sortState = getSortState(oltId);
          const sortedONTList = getSortedONTList(oltId, ontList);
            const isExpanded = expandedOLTs.has(oltId);
            
            // Hitung status untuk OLT ini
            const totalONTInOLT = ontList.length;
            const offlineONTInOLT = ontList.filter(d => d.status?.toLowerCase() === 'offline' && d.offline_cause === 'dying-gasp').length;
            const losONTInOLT = ontList.filter(d => d.status?.toLowerCase() === 'offline' && d.offline_cause !== 'dying-gasp').length;
            const redamanTinggiInOLT = ontList.filter(d => d.attenuation < -25).length;
          
          return (
              <Box 
                component="div"
                key={oltId} 
                sx={{ mb: 4 }}
              >
              <Typography 
                variant="h6" 
                  onClick={() => toggleOLT(oltId)}
                sx={{ 
                  mb: 1, 
                  p: 1, 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#eeeeee'
                    }
                }}
              >
                  {isExpanded ? (
                    <ChevronDown size={20} style={{ marginRight: 4 }} />
                  ) : (
                    <ChevronRight size={20} style={{ marginRight: 4 }} />
                  )}
                {oltId}
                  <Typography 
                    component="span" 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      ml: 1,
                      fontWeight: 'normal'
                    }}
                  >
                    ({ontList.length} // 
                    <span style={{ color: '#ff4500' }}> {offlineONTInOLT} </span>
                    <span style={{ color: '#111'}}>//</span>
                    <span style={{ color: '#ff0033' }}> {losONTInOLT} </span>
                    <span style={{ color: '#111'}}>//</span>
                    <span style={{ color: '#ffa726' }}> {redamanTinggiInOLT}</span>) 
                </Typography>
              </Typography>
              
                {isExpanded && (
              <TableContainer 
                component={Paper} 
                sx={{ 
                  maxHeight: 400,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  borderRadius: 2,
                  mb: 2
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow sx={{ background: '#f9f9f9' }}>
                      {TABLE_COLUMNS.map((col) => (
                        <TableCell
                          key={col.id}
                          sx={{
                            backgroundColor: '#f9f9f9',
                            color: '#333',
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            textTransform: 'uppercase',
                            borderBottom: '2px solid #e0e0e0',
                            cursor: 'pointer',
                            userSelect: 'none',
                            whiteSpace: col.id === 'offline_cause' ? 'normal' : 'nowrap',
                            ...(col.id === 'serial_number' && { minWidth: 90, maxWidth: 120, width: 100 }),
                            ...(col.id === 'customer_id' && { minWidth: 80, maxWidth: 110, width: 90 }),
                            ...(col.id === 'customer_name' && { minWidth: 110, maxWidth: 140, width: 120 }),
                            ...(col.id === 'status' && { minWidth: 50, maxWidth: 80, width: 60 }),
                            ...(col.id === 'attenuation' && { minWidth: 50, maxWidth: 80, width: 60 }),
                            ...(col.id === 'offline_cause' && { minWidth: 80, maxWidth: 100, width: 90 }),
                            ...(col.id === 'timestamp' && { minWidth: 120, maxWidth: 150, width: 130 }),
                          }}
                          onClick={() => handleRequestSort(oltId, col.id)}
                          align={['status', 'attenuation', 'offline_cause', 'timestamp'].includes(col.id) ? 'center' : 'left'}
                        >
                          {col.id === 'offline_cause' ? (
                            <span>Penyebab<br />Offline</span>
                          ) : col.label}
                          <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginLeft: 4, verticalAlign: 'middle', height: 28, justifyContent: 'center' }}>
                            {sortState.orderBy === col.id ? (
                              sortState.order === 'asc' ? (
                                <ArrowUp size={18} color="#bbb" />
                              ) : (
                                <ArrowDown size={18} color="#bbb" />
                              )
                            ) : (
                              <ArrowUpDown size={18} color="#bbb" />
                            )}
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedONTList.map((row) => (
                      <TableRow key={row.serial_number}>
                        <TableCell sx={{ minWidth: 90, maxWidth: 120, width: 100 }}>{row.serial_number || "Belum di polling"}</TableCell>
                        <TableCell sx={{ minWidth: 80, maxWidth: 110, width: 90 }}>{row.customer_id || "Belum di polling"}</TableCell>
                        <TableCell sx={{ minWidth: 110, maxWidth: 140, width: 120 }}>{row.customer_name || "Belum di polling"}</TableCell>
                        <TableCell sx={{ color: getStatusColor(row.status), minWidth: 50, maxWidth: 80, width: 60 }} align="center">
                          {row.status || "Belum di polling"}
                        </TableCell>
                        <TableCell sx={{ color: getRedamanColor(row.attenuation), minWidth: 50, maxWidth: 80, width: 60 }} align="center">
                          {row.attenuation !== undefined ? row.attenuation : "Belum di polling"}
                        </TableCell>
                        <TableCell sx={{ minWidth: 70, maxWidth: 100, width: 80 }} align="center">{row.offline_cause || "Belum di polling"}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatTimestamp(row.timestamp)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
                )}
            </Box>
          );
        })}
      </Box>

      {/* Dialog untuk menampilkan tabel */}
      <DialogTable
        open={dialogOpen}
        onClose={handleCloseDialog}
        title={dialogTitle}
        data={dialogData}
        getStatusColor={getStatusColor}
        getRedamanColor={getRedamanColor}
        formatTimestamp={formatTimestamp}
      />

      <Snackbar
        open={showToast.open}
        autoHideDuration={6000}
        onClose={() => setShowToast({ ...showToast, open: false })}
      >
        <Alert severity="error" onClose={() => setShowToast({ ...showToast, open: false })}>
          {showToast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;