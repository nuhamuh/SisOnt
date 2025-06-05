import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
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
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronDown, ChevronRight } from 'lucide-react';
import { fetchONTList, deleteONT, addONT } from '../services/api';
import AddOntForm from '../components/forms/AddOntForm';

interface ONTData {
  id_olt: string;
  customer_name: string;
  serial_number: string;
  customer_id: string;
}

interface SortState {
  order: 'asc' | 'desc';
  orderBy: keyof ONTData;
}

const DataONT: React.FC = () => {
  const [data, setData] = useState<ONTData[]>([]);
  const [showToast, setShowToast] = useState({ 
    open: false, 
    message: '',
    severity: 'error' as 'error' | 'success'
  });
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [sortStates, setSortStates] = useState<Map<string, SortState>>(new Map());
  const [expandedOLTs, setExpandedOLTs] = useState<Set<string>>(new Set());

  // Fungsi untuk mengelompokkan data berdasarkan ID OLT
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
      if (typeof a[orderBy] === 'string' && typeof b[orderBy] === 'string') {
        const compareResult = (a[orderBy] as string).localeCompare(b[orderBy] as string);
        return order === 'asc' ? compareResult : -compareResult;
      }
      return 0;
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchONTList();
        setData(response.data);
      } catch (error) {
        setShowToast({
          open: true,
          message: 'Gagal memuat data ONT',
          severity: 'error'
        });
      }
    };
    
    loadData();
  }, []);

  const handleDelete = async (serialNumber: string) => {
    try {
      const response = await deleteONT(serialNumber);
      if (response.status === 'success') {
        setData(data.filter(item => item.serial_number !== serialNumber));
        setShowToast({
          open: true,
          message: response.message,
          severity: 'success'
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setShowToast({
        open: true,
        message: 'Gagal menghapus ONT',
        severity: 'error'
      });
    }
  };

  const handleAddONT = async (newONT: ONTData) => {
    try {
      const response = await addONT(newONT);
      if (response.status === 'success') {
        setData([...data, newONT]);
        setOpenAddDialog(false);
        setShowToast({
          open: true,
          message: response.message,
          severity: 'success'
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setShowToast({
        open: true,
        message: 'Gagal menambahkan ONT',
        severity: 'error'
      });
    }
  };

  const columns: { id: keyof ONTData, label: string }[] = [
    { id: 'serial_number', label: 'SN ONT' },
    { id: 'customer_id', label: 'ID Pelanggan' },
    { id: 'customer_name', label: 'Nama Pelanggan' },
  ];

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

  return (
    <Box sx={{ p: 2}}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Data ONT</Typography>
        <Button
          variant="contained"
          sx={{ 
            backgroundColor: 'black',
            color: 'white',
            '&:hover': {
              backgroundColor: '#333'
            }
          }}
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
        >
          Tambah ONT
        </Button>
      </Box>

      {Array.from(groupDataByOLT(data).entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([oltId, ontList]) => {
          const sortState = getSortState(oltId);
          const sortedONTList = getSortedONTList(oltId, ontList);
          const isExpanded = expandedOLTs.has(oltId);
          
          return (
            <Box key={oltId} sx={{ mb: 3 }}>
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
                  ({ontList.length} ONT)
                </Typography>
              </Typography>
              
              {isExpanded && (
                <Box>
              <TableContainer 
                component={Paper} 
                sx={{ 
                  maxHeight: 400,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  borderRadius: 2
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow sx={{ background: '#f9f9f9' }}>
                      {columns.map((col) => (
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
                            whiteSpace: 'nowrap',
                            ...(col.id === 'serial_number' && { minWidth: 90, maxWidth: 120, width: 100 }),
                            ...(col.id === 'customer_id' && { minWidth: 80, maxWidth: 110, width: 90 }),
                            ...(col.id === 'customer_name' && { minWidth: 110, maxWidth: 140, width: 120 }),
                          }}
                          onClick={() => handleRequestSort(oltId, col.id)}
                          align="left"
                        >
                          {col.label}
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
                      <TableCell 
                        sx={{ 
                          backgroundColor: '#f9f9f9',
                          borderBottom: '2px solid #e0e0e0',
                          width: 60,
                          p: 1.5
                        }}
                      />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedONTList.map((row) => (
                      <TableRow key={row.serial_number}>
                        <TableCell sx={{ minWidth: 90, maxWidth: 120, width: 100 }}>{row.serial_number}</TableCell>
                        <TableCell sx={{ minWidth: 80, maxWidth: 110, width: 90 }}>{row.customer_id}</TableCell>
                        <TableCell sx={{ minWidth: 110, maxWidth: 140, width: 120 }}>{row.customer_name}</TableCell>
                        <TableCell sx={{ p: 1.5 }}>
                          <IconButton
                            onClick={() => handleDelete(row.serial_number)}
                            size="small"
                            sx={{
                              color: 'error.main',
                              padding: '4px',
                              '&:hover': {
                                backgroundColor: 'error.light',
                                color: 'white'
                              }
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: '1.6rem' }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
                </Box>
              )}
            </Box>
          );
        })}

      <AddOntForm
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onSubmit={handleAddONT}
      />

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

export default DataONT; 