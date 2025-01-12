import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  TextField,
  Autocomplete,
  Box,
  Grid,
  Paper,
  Typography,
  Button,
} from "@mui/material";
import {
  getFormsByVehicleID,
  getFormsByHeadCatName,
  getFormsBySubCatName,
  getFormsByAmount,
  getFormsByFyYear,
  getFormsByMonth,
  getFormsByEmployeeID,
  getFormsByParticulars,
  getFormsByDate,
  getforms,
  getHeadCat,
  getSubCat,
  getMonth,
  getEmployee,
  getVehicle,
  getFyYear,
  deleteFormById,
} from "./axios";
import Dash from "./dash";
import { PDFDocument, rgb } from "pdf-lib";
import jsPDF from "jspdf";
import "jspdf-autotable";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import Dial from "./speeddial";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { useNavigate } from "react-router-dom";

// Define custom styling for column headers
const useStyles = {
  header: {
    backgroundColor: "#32348c", // Your preferred color
    color: "#ffffff", // Ensure the text is readable
    fontSize: "16px",
    fontWeight: "bold",
  },
};

const Table = () => {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({
    vehicleId: "",
    headCategory: "",
    subCategory: "",
    amount: "",
    fyYear: "",
    month: "",
    employeeId: "",
    particulars: "",
    date: null,
  });

  const [headCats, setHeadCats] = useState([]);
  const [subCats, setSubCats] = useState([]);
  const [months, setMonths] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [fyYears, setFyYears] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [
          headCatData,
          subCatData,
          monthData,
          employeeData,
          vehicleData,
          fyYearData,
        ] = await Promise.all([
          getHeadCat(),
          getSubCat(),
          getMonth(),
          getEmployee(),
          getVehicle(),
          getFyYear(),
        ]);
        setHeadCats(headCatData);
        setSubCats(subCatData);
        setMonths(monthData);
        setEmployees(employeeData);
        setVehicles(vehicleData);
        setFyYears(fyYearData);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdownData();
  }, []);

  const handleFilterChange = (e, value, name) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchForms = async () => {
      try {
        let data = [];
        if (filters.vehicleId) {
          data = await getFormsByVehicleID(filters.vehicleId);
        } else if (filters.headCategory) {
          data = await getFormsByHeadCatName(filters.headCategory);
        } else if (filters.subCategory) {
          data = await getFormsBySubCatName(filters.subCategory);
        } else if (filters.amount) {
          data = await getFormsByAmount(filters.amount);
        } else if (filters.fyYear) {
          data = await getFormsByFyYear(filters.fyYear);
        } else if (filters.month) {
          data = await getFormsByMonth(filters.month);
        } else if (filters.employeeId) {
          data = await getFormsByEmployeeID(filters.employeeId);
        } else if (filters.particulars) {
          data = await getFormsByParticulars(filters.particulars);
        } else if (filters.date) {
          data = await getFormsByDate(format(filters.date, "dd-MM-yyyy"));
        } else {
          data = await getforms();
        }

        const formattedData = data.map((form, index) => ({
          objectId: form._id,
          id: index + 1,
          vehicleId: form.vehicles?.vehicle_id || "N/A",
          date: form.date,
          headCategory: form.head_cat?.head_cat_name || "N/A",
          subCategory: form.sub_cat?.sub_cat_name || "N/A",
          particulars: form.particulars,
          amount: form.amount,
          pdfLink: form.files,
          fyYear: form.fy_year?.fy_name || "N/A",
          month: form.month?.month_name || "N/A",
          employeeId:
            form.received_by?.map((emp) => emp.emp_id).join(", ") || "N/A",
          departments: form.departments?.dept_full_name || "N/A",
          bill_no: form.bill_no || "N/A",
        }));

        setRows(formattedData);
      } catch (error) {
        console.error("Error fetching forms:", error);
      }
    };

    fetchForms();
  }, [filters]);

  const handlePdfGeneration = async (rowData) => {
    const doc = new jsPDF();
    let yOffset = 10; // Initial Y position for details

    const addDetail = (text) => {
      if (yOffset > 280) {
        // Check if we've exceeded the page height
        doc.addPage(); // Add a new page
        yOffset = 10; // Reset the Y offset for the new page
      }
      doc.text(10, yOffset, text);
      yOffset += 10; // Increment the Y offset for the next detail
    };

    // Define the table data
    const tableData = [
      ["Vehicle ID", rowData.vehicleId],
      ["Date", rowData.date],
      ["Head Category", rowData.headCategory],
      ["Sub Category", rowData.subCategory],
      ["Particulars", rowData.particulars],
      ["Amount", rowData.amount],
      ["Financial Year", rowData.fyYear],
      ["Month", rowData.month],
      ["Bill Number", rowData.bill_no],
      ["Departments", rowData.departments],
      ["Employee ID", rowData.employeeId],
    ];

    // Generate the table
    doc.autoTable({
      startY: yOffset + 5,
      head: [["Field", "Value"]],
      body: tableData,
      theme: "grid",
      margin: { top: 10 },
    });

    const pdfBlob = doc.output("blob");

    // Create a URL for the blob
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Open the PDF URL in a new browser tab
    window.open(pdfUrl, "_blank");
  };

  const isAdmin = sessionStorage.getItem('admin') === 'true';

const columns = [
  {
    field: "id",
    headerName: <b>S.No</b>,
    flex: 0.5,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "vehicleId",
    headerName: <b>VEHICLE ID</b>,
    flex: 1,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "date",
    headerName: <b>DATE</b>,
    flex: 1,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "headCategory",
    headerName: <b>HEAD CATEGORY</b>,
    flex: 1.5,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "subCategory",
    headerName: <b>SUB CATEGORY</b>,
    flex: 1.5,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "particulars",
    headerName: <b>PARTICULARS</b>,
    flex: 1.5,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "amount",
    headerName: <b>AMOUNT</b>,
    flex: 1,
    headerClassName: "super-app-theme--header",
  },
  {
    field: "pdfLink",
    headerName: <b>PDF</b>,
    flex: 0.5,
    headerClassName: "super-app-theme--header",
    renderCell: (params) => (
      <IconButton
        component="a"
        href={`http://localhost:1111/merged_pdfs/${params.value}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <PictureAsPdfRoundedIcon />
      </IconButton>
    ),
  },
  {
    field: "generatePdf",
    headerName: <b>GEN PDF</b>,
    flex: 0.7,
    headerClassName: "super-app-theme--header",
    renderCell: (params) => (
      <IconButton onClick={() => handlePdfGeneration(params.row)}>
        <PreviewRoundedIcon />
      </IconButton>
    ),
  },
  isAdmin && {
    field: "actions",
    headerName: <b>ACTIONS</b>,
    flex: 1,
    headerClassName: "super-app-theme--header",
    renderCell: (params) => (
      <div>
        <IconButton onClick={() => handleEdit(params.row.objectId)}>
          <EditIcon />
        </IconButton>
        <IconButton
          onClick={() => handleDelete(params.row.objectId)}
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      </div>
    ),
  },
].filter(Boolean); // Remove undefined columns if not admin


  const handleClear = () => {
    setFilters({
      vehicleId: "",
      headCategory: "",
      subCategory: "",
      amount: "",
      fyYear: "",
      month: "",
      employeeId: "",
      particulars: "",
      date: null,
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteFormById(id);
      setRows((prevRows) => prevRows.filter((row) => row.objectId !== id));
    } catch (error) {
      console.error("Failed to delete the form:", error);
    }
  };

  const handleEdit = (objectId) => {
    console.log(`Edit row with ID: ${objectId}`);
    navigate(`/update/${objectId}`);
  };

  return (
    <div>
      <Dash />
      <div
        style={{
          padding: "50px",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
          marginTop: "50px",
        }}
      >
        <Paper style={{ padding: 20, marginBottom: 20 }}>
          <Typography
            variant="h4"
            align="center"
            sx={{
              backgroundColor: "#32348c",
              color: "white",
              borderRadius: "5px",
              marginBottom: "10px",
            }}
          >
            <b>YOUR REPORT</b>
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={vehicles.map((v) => v.vehicle_id)}
                renderInput={(params) => (
                  <TextField
                    variant="standard"
                    {...params}
                    label="Vehicle ID"
                  />
                )}
                value={filters.vehicleId}
                onChange={(e, value) =>
                  handleFilterChange(e, value, "vehicleId")
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={headCats.map((hc) => hc.head_cat_name)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="Head Category"
                  />
                )}
                value={filters.headCategory}
                onChange={(e, value) =>
                  handleFilterChange(e, value, "headCategory")
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={subCats.map((sc) => sc.sub_cat_name)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="Sub Category"
                  />
                )}
                value={filters.subCategory}
                onChange={(e, value) =>
                  handleFilterChange(e, value, "subCategory")
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                type="number"
                name="amount"
                label="Amount"
                variant="standard"
                value={filters.amount}
                onChange={(e) =>
                  handleFilterChange(e, e.target.value, "amount")
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={fyYears.map((fy) => fy.fy_name)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="Financial Year"
                  />
                )}
                value={filters.fyYear}
                onChange={(e, value) => handleFilterChange(e, value, "fyYear")}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={months.map((m) => m.month_name)}
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Month" />
                )}
                value={filters.month}
                onChange={(e, value) => handleFilterChange(e, value, "month")}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={employees.map((emp) => emp.emp_id)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="Employee ID"
                  />
                )}
                value={filters.employeeId}
                onChange={(e, value) =>
                  handleFilterChange(e, value, "employeeId")
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                type="text"
                name="particulars"
                label="Particulars"
                variant="standard"
                value={filters.particulars}
                onChange={(e) =>
                  handleFilterChange(e, e.target.value, "particulars")
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DesktopDatePicker
                  label="Select Date"
                  format="dd/MM/yyyy"
                  value={filters.date || null}
                  onChange={(newValue) =>
                    handleFilterChange(null, newValue, "date")
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
              <Button
                onClick={handleClear}
                variant="contained"
                color="error"
                style={{
                  padding: "10px",
                  marginLeft: "10px",
                  marginTop: "5px",
                }}
              >
                CLEAR FILTER
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ height: 600, width: "100%", marginTop: "15px" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10} // Set page size to 10
              pagination
              sx={{
                "& .super-app-theme--header": useStyles.header, // Apply the header styling
                "& .MuiDataGrid-columnHeader": {
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }, // Fix header position
                "& .MuiDataGrid-cell": {
                  padding: "8px",
                },
              }}
            />
          </Box>
        </Paper>
      </div>
      <Dial />
    </div>
  );
};

export default Table;
