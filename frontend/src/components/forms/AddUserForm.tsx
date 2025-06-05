import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

interface AddUserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
}

const validationSchema = yup.object({
  username: yup.string().required('Username diperlukan'),
  password: yup.string()
    .required('Password diperlukan')
    .min(6, 'Password minimal 6 karakter'),
  role: yup.string().required('Role diperlukan'),
});

const AddUserForm: React.FC<AddUserFormProps> = ({ open, onClose, onSubmit }) => {
  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      role: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
      formik.resetForm();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tambah User Baru</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              id="username"
              name="username"
              label="Username"
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
            />
            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
            <TextField
              fullWidth
              id="role"
              name="role"
              select
              label="Role"
              value={formik.values.role}
              onChange={formik.handleChange}
              error={formik.touched.role && Boolean(formik.errors.role)}
              helperText={formik.touched.role && formik.errors.role}
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="User">User</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Batal</Button>
          <Button type="submit" variant="contained">Simpan</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddUserForm; 