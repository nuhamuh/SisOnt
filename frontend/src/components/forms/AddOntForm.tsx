import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

interface AddOntFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
}

const validationSchema = yup.object({
  id_olt: yup.string().required('ID OLT diperlukan'),
  serial_number: yup.string().required('Serial Number diperlukan'),
  customer_id: yup.string().required('ID Pelanggan diperlukan'),
  customer_name: yup.string().required('Nama Pelanggan diperlukan'),
});

const AddOntForm: React.FC<AddOntFormProps> = ({ open, onClose, onSubmit }) => {
  const formik = useFormik({
    initialValues: {
      id_olt: '',
      serial_number: '',
      customer_id: '',
      customer_name: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
      formik.resetForm();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tambah ONT Baru</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              id="id_olt"
              name="id_olt"
              label="ID OLT"
              value={formik.values.id_olt}
              onChange={formik.handleChange}
              error={formik.touched.id_olt && Boolean(formik.errors.id_olt)}
              helperText={formik.touched.id_olt && formik.errors.id_olt}
            />
            <TextField
              fullWidth
              id="serial_number"
              name="serial_number"
              label="Serial Number ONT"
              value={formik.values.serial_number}
              onChange={formik.handleChange}
              error={formik.touched.serial_number && Boolean(formik.errors.serial_number)}
              helperText={formik.touched.serial_number && formik.errors.serial_number}
            />
            <TextField
              fullWidth
              id="customer_id"
              name="customer_id"
              label="ID Pelanggan"
              value={formik.values.customer_id}
              onChange={formik.handleChange}
              error={formik.touched.customer_id && Boolean(formik.errors.customer_id)}
              helperText={formik.touched.customer_id && formik.errors.customer_id}
            />
            <TextField
              fullWidth
              id="customer_name"
              name="customer_name"
              label="Nama Pelanggan"
              value={formik.values.customer_name}
              onChange={formik.handleChange}
              error={formik.touched.customer_name && Boolean(formik.errors.customer_name)}
              helperText={formik.touched.customer_name && formik.errors.customer_name}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} sx={{ color: 'black'}}>Batal</Button>
          <Button type="submit" variant="contained" sx={{ backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: '#333' }}}>Simpan</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddOntForm; 