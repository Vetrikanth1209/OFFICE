import React, { useState, useEffect, useCallback } from 'react';
import { TextField, Button, Autocomplete, Grid, Box, Typography, Chip, Snackbar, Alert } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { getFormById, modifyForm, getHeadCat, getSubCat, getMonth, getDepartment, getEmployee, getVehicle, getFyYear } from './axios';
import Dash from './dash';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';

const Update = ({ handleClose  }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fy_year, setFyYear] = useState(null);
  const [month, setMonth] = useState(null);
  const [head_cat, setHeadCat] = useState(null);
  const [sub_cat, setSubCat] = useState(null);
  const [date, setDate] = useState(null);
  const [received_by, setReceivedBy] = useState([]);
  const [particulars, setParticulars] = useState('');
  const [bill_no, setBillNo] = useState('');
  const [departments, setDepartments] = useState(null);
  const [amount, setAmount] = useState('');
  const [vehicles, setVehicles] = useState(null);

  const [headCats, setHeadCats] = useState([]);
  const [subCats, setSubCats] = useState([]);
  const [months, setMonths] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [fyYears, setFyYears] = useState([]);

  const [isSubCatDisabled, setIsSubCatDisabled] = useState(true);
  const [isDepartmentDisabled, setIsDepartmentDisabled] = useState(true);
  const [isVehicleDisabled, setIsVehicleDisabled] = useState(true);

  // State variables...
  const [files, setFiles] = useState([]);  // Modified to handle both new and old files
  const [oldFiles, setOldFiles] = useState([]);  // To store files fetched from the backend

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  

  // Fetch data for dropdowns and lists
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [headCatData, subCatData, monthData, departmentData, employeeData, vehicleData, fyYearData] = await Promise.all([
          getHeadCat(),
          getSubCat(),
          getMonth(),
          getDepartment(),
          getEmployee(),
          getVehicle(),
          getFyYear()
        ]);

        setHeadCats(headCatData.filter(cat => cat.head_cat_status === true));
        setSubCats(subCatData.filter(subCat => subCat.sub_cat_status === true));
        setMonths(monthData.filter(month => month.month_id === true));
        setDepartmentsList(departmentData);
        setEmployees(employeeData);
        setVehiclesList(vehicleData);
        setFyYears(fyYearData.filter(fyYear => fyYear.fy_id === true));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Fetch form details by ID from the URL and populate the fields
  useEffect(() => {
    const fetchFormDetails = async () => {
      if (id) {
        try {
          const formDetails = await getFormById(id);
  
          // Assuming formDetails is a single object and not an array
          setFyYear(formDetails.fy_year || null);
          setMonth(formDetails.month || null);
          setHeadCat(formDetails.head_cat || null);
          setSubCat(formDetails.sub_cat || null);
          setDate(formDetails.date ? new Date(formDetails.date) : null);
          setReceivedBy(formDetails.received_by || []);
          setParticulars(formDetails.particulars || '');
          setBillNo(formDetails.bill_no || '');
          setDepartments(formDetails.departments || []); // Assuming departments is an array
          setAmount(formDetails.amount || '');
          setVehicles(formDetails.vehicles || null);
          setFiles(formDetails.uploads || []);
          setOldFiles(formDetails.uploads || []);  // Store the old files separately
        } catch (error) {
          console.error('Error fetching form details:', error);
        }
      }
    };
  
    fetchFormDetails();
  }, [id]);
  

  useEffect(() => {
    if (sub_cat || head_cat) {
      setIsSubCatDisabled(false);
    } else {
      setIsSubCatDisabled(true);
    }
  
    if (sub_cat) {
      const subCatSplId = sub_cat.spl_id;
      const departmentEnabled = departmentsList.some(dept => dept.spl_id === subCatSplId);
      const vehicleEnabled = vehiclesList.some(vehicle => vehicle.spl_id === subCatSplId);
  
      setIsDepartmentDisabled(!departmentEnabled);
      setIsVehicleDisabled(!vehicleEnabled);
  
      if (!departmentEnabled) setDepartments(null);
      if (!vehicleEnabled) setVehicles(null);
    }
  }, [sub_cat, head_cat, departmentsList, vehiclesList]);
  

  const [errors, setErrors] = useState({});


  const validateForm = () => {
    const errors = {};

    if (!fy_year) errors.fy_year = 'Fiscal Year is required';
    if (!month) errors.month = 'Month is required';
    if (!date) errors.date = 'Date is required';
    if (!head_cat) errors.head_cat = 'Head Category is required';
    if (!sub_cat) errors.sub_cat = 'Sub Category is required';
    if (!particulars) errors.particulars = 'Particulars are required';
    if (!bill_no) errors.bill_no = 'Bill Number is required';
    if (!amount) errors.amount = 'Amount is required';
    if (!received_by || received_by.length === 0) errors.received_by = 'Received By is required';
    if (!departments && !isDepartmentDisabled) errors.departments = 'Department is required';
    if (!vehicles && !isVehicleDisabled) errors.vehicles = 'Vehicle is required';

    setErrors(errors);

    const isFormComplete = Object.keys(errors).length === 0;
    const isFileUploaded = files.length > 0;

    if (!isFormComplete) {
      setSnackbarMessage('Please fill in all required fields.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } else if (isFormComplete && !isFileUploaded) {
      setSnackbarMessage('Please upload at least one file.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }

    return isFormComplete && isFileUploaded ? null : errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors) {
      return;
    }

    const formattedDate = date ? format(new Date(date), 'yyyy-MM-dd') : '';

    const serializedData = {
      _id: id, 
      fy_year: fy_year ? JSON.stringify(fy_year) : null,
      month: month ? JSON.stringify(month) : null,
      head_cat: head_cat ? JSON.stringify(head_cat) : null,
      sub_cat: sub_cat ? JSON.stringify(sub_cat) : null,
      date: formattedDate,
      received_by: received_by ? JSON.stringify(received_by) : [],
      particulars,
      bill_no,
      departments: departments ? JSON.stringify(departments) : null,
      amount,
      vehicles: vehicles ? JSON.stringify(vehicles) : null,
    };

    try {
      const result = await modifyForm(serializedData, files);
      setSnackbarMessage('The Report was Submitted Successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      setTimeout(() => {
        navigate('/table');
      }, 3000);
    } catch (error) {
      setSnackbarMessage('Error adding form: ' + error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };


  const handleClear = () => {
    setFyYear(null);
    setMonth(null);
    setHeadCat(null);
    setSubCat(null);
    setDate(null);
    setReceivedBy([]);
    setParticulars('');
    setBillNo('');
    setDepartments(null);
    setAmount('');
    setVehicles(null);
    setIsSubCatDisabled(true);
    setIsDepartmentDisabled(true);
    setIsVehicleDisabled(true);
    setFiles([]);
  };

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
    },
  });

  const handleFileRemove = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter(file => file.name !== fileName));
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div>
      <Dash />
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 12 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 4,
            boxShadow: 3,
            borderRadius: 2,
            width: '60%',
            bgcolor: 'background.paper',
            borderRadius: '50px'
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom
            style={{ backgroundColor: '#32348c', color: '#fff', textAlign: 'center', borderRadius: '50px' }}>
            <b>REPORT</b>
          </Typography>
          <Grid container spacing={2}>
            {/* Fiscal Year, Month, and Selected Date */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Autocomplete
                    options={fyYears}
                    getOptionLabel={(option) => option.fy_name}
                    value={fy_year}
                    onChange={(e, newValue) => setFyYear(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Fiscal Year"
                        error={!!errors.fy_year}
                        helperText={errors.fy_year || ''}
                        sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Autocomplete
                    options={months}
                    getOptionLabel={(option) => option.month_name}
                    value={month}
                    onChange={(e, newValue) => setMonth(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Month"
                        error={!!errors.month}
                        helperText={errors.month || ''}
                        sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DesktopDatePicker
                      label="Date"
                      inputFormat="MM/DD/YYYY"
                      value={date}
                      onChange={(newValue) => setDate(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Grid>

            {/* Head Category and Sub Category */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Autocomplete
                    options={headCats}
                    getOptionLabel={(option) => option.head_cat_name}
                    value={head_cat}
                    onChange={(e, newValue) => {
                      setHeadCat(newValue);
                      setIsSubCatDisabled(newValue === null);
                      if (newValue === null) {
                        setSubCat(null);
                        setDepartments(null);
                        setVehicles(null);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Head Category"
                        error={!!errors.head_cat}
                        helperText={errors.head_cat || ''}
                        sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
                      />
                    )}
                  />

                </Grid>
                <Grid item xs={6}>
                  <Autocomplete
                    options={subCats}
                    getOptionLabel={(option) => option.sub_cat_name}
                    value={sub_cat}
                    onChange={(e, newValue) => setSubCat(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Sub Category"
                        error={!!errors.sub_cat}
                        helperText={errors.sub_cat || ''}
                        sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
                      />
                    )}
                    disabled={isSubCatDisabled}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Departments and Vehicles */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Autocomplete
                    options={departmentsList}
                    getOptionLabel={(option) => option.dept_full_name}
                    value={departments}
                    onChange={(e, newValue) => setDepartments(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Departments"
                        error={!!errors.departments}
                        helperText={errors.departments || ''}
                        sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
                      />
                    )}
                    disabled={isDepartmentDisabled}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Autocomplete
                    options={vehiclesList}
                    getOptionLabel={(option) => option.vehicle_name}
                    value={vehicles}
                    onChange={(e, newValue) => setVehicles(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Vehicles"
                        error={!!errors.vehicles}
                        helperText={errors.vehicles || ''}
                        sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
                      />
                    )}
                    disabled={isVehicleDisabled}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Received By and Particulars */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Autocomplete
                    multiple
                    options={employees}
                    getOptionLabel={(option) => option.emp_name}
                    value={received_by}
                    onChange={(e, newValue) => setReceivedBy(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Received By"
                        error={!!errors.received_by}
                        helperText={errors.received_by || ''}
                        sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Particulars"
                    value={particulars}
                    onChange={(e) => setParticulars(e.target.value)}
                    error={!!errors.particulars}
                    helperText={errors.particulars || ''}
                    sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Bill Number and Amount */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Bill Number"
                    value={bill_no}
                    onChange={(e) => setBillNo(e.target.value)}
                    error={!!errors.bill_no}
                    helperText={errors.bill_no || ''}
                    sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    error={!!errors.amount}
                    helperText={errors.amount || ''}
                    sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* File Upload and Display */}
            <Grid item xs={12}>
              <Box
                {...getRootProps()}
                sx={{
                  borderRadius: '50px',
                  p: 1,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#1565c0',
                  transition: 'background-color 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    backgroundColor: '#1e88e5',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                <input {...getInputProps()} />
                <Typography style={{ color: '#ffff' }} variant="body1">UPLOAD FILE</Typography>
              </Box>
              <Box sx={{ mt: '15px', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {files.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => handleFileRemove(file.name)}
                    color="primary"
                  />
                ))}
              </Box>
            </Grid>

            {/* Submit and Clear Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button type="submit" variant="contained" color="success" sx={{ flexGrow: 1, mr: 1, borderRadius: '50px' }}>
                  Submit
                </Button>
                <Button variant="contained" color="error" onClick={handleClear} sx={{ flexGrow: 1, borderRadius: '50px' }}>
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Snackbar for Notifications */}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Update;
