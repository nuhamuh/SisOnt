import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import AddUserForm from '../components/forms/AddUserForm';
import { fetchUsers, addUser, deleteUser } from '../services/api';

interface User {
  id: number;
  username: string;
  role: string;
}

const Users: React.FC = () => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showToast, setShowToast] = useState({ open: false, message: '' });
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetchUsers();
        setUsers(response.data);
      } catch (error) {
        setShowToast({
          open: true,
          message: 'Gagal memuat data users'
        });
      }
    };
    
    loadUsers();
  }, []);

  const handleAddUser = async (values: any) => {
    try {
      await addUser(values);
      const response = await fetchUsers();
      setUsers(response.data);
      setShowToast({
        open: true,
        message: 'User berhasil ditambahkan'
      });
      setOpenAddDialog(false);
    } catch (error) {
      setShowToast({
        open: true,
        message: 'Gagal menambahkan user'
      });
    }
  };

  const handleDelete = (id: number) => {
    setSelectedId(id);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedId) {
      try {
        await deleteUser(selectedId);
        setUsers(users.filter(user => user.id !== selectedId));
        setShowToast({
          open: true,
          message: "User berhasil dihapus"
        });
      } catch (error) {
        setShowToast({
          open: true,
          message: "Gagal menghapus user"
        });
      }
      setOpenDeleteDialog(false);
    }
  };

  const handleEdit = (id: number) => {
    // Implement edit logic
    console.log('Edit user:', id);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
          sx={{
            backgroundColor: 'black',
            '&:hover': {
              backgroundColor: '#333'
            }
          }}
        >
          Tambah User
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell sx={{ color: '#666' }}>{user.role}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <IconButton
                      size="small"
                      sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        padding: '4px'
                      }}
                      onClick={() => handleEdit(user.id)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{
                        backgroundColor: '#ef5350',
                        borderRadius: 1,
                        padding: '4px',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#e53935'
                        }
                      }}
                      onClick={() => handleDelete(user.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AddUserForm
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onSubmit={handleAddUser}
      />

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Batal</Button>
          <Button onClick={confirmDelete} color="error">Hapus</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showToast.open}
        autoHideDuration={3000}
        onClose={() => setShowToast({ ...showToast, open: false })}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {showToast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Users; 