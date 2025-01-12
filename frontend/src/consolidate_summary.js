import React, { useState, useEffect } from "react";
import {
  Box,
  Autocomplete,
  TextField,
  Button,
  Typography,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import axios from "axios";
import {
  getFyYearOptions,
  getMonthOptions,
  getFormsByFyYearAndMonth,
  dateFilter,
} from "./axios";
import { PDFDocument } from "pdf-lib";
import Dash from "./dash";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { enGB } from "date-fns/locale";
import { format } from "date-fns/esm";

// Utility function to fetch the PDF files
const fetchPDF = async (fileUrl) => {
  try {
    const response = await axios.get(fileUrl, { responseType: "blob" });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.warn("PDF file not found:", fileUrl);
    } else {
      console.error("Error fetching PDF file:", error);
    }
    return null; // Return null if there's an error
  }
};

const ConsolidateAndSummary = () => {
  const [fyYearOptions, setFyYearOptions] = useState([]);
  const [monthOptions, setMonthOptions] = useState([]);
  const [summaryFyYear, setSummaryFyYear] = useState(null);
  const [summaryMonth, setSummaryMonth] = useState(null);
  const [consolidateFyYear, setConsolidateFyYear] = useState(null);
  const [consolidateMonth, setConsolidateMonth] = useState(null);
  const [errors, setErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const validateSummaryFields = () => {
    const errors = {};
    if (!summaryFyYear) errors.summaryFyYear = "Fy Year is required";
    if (!summaryMonth) errors.summaryMonth = "Month is required";

    setErrors(errors);

    if (Object.keys(errors).length > 0) {
      setSnackbarMessage("Please fill in all required fields for Summary.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }
    return true;
  };

  const validateConsolidateFields = () => {
    const errors = {};
    if (!consolidateFyYear) errors.consolidateFyYear = "Fy Year is required";
    if (!consolidateMonth) errors.consolidateMonth = "Month is required";

    setErrors(errors);

    if (Object.keys(errors).length > 0) {
      setSnackbarMessage(
        "Please fill in all required fields for Consolidation."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }
    return true;
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [fyYears, months] = await Promise.all([
          getFyYearOptions(),
          getMonthOptions(),
        ]);
        setFyYearOptions(fyYears.map((item) => item.fy_year));
        setMonthOptions(months.map((item) => item.month));
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  const generatePDF = async () => {
    if (!validateSummaryFields()) return;
    setLoading(true);

    try {
      const fyYearName = summaryFyYear.fy_name;
      const monthName = summaryMonth.month_name;

      const data = await getFormsByFyYearAndMonth(fyYearName, monthName);
      console.log("Summary Data:", data);
      console.log(fyYearName, monthName);

      // Create a new PDF document for summary
      const summaryDoc = new jsPDF();

      // Add centered "SUMMARY REPORT" title with background color and white text
      summaryDoc.setFontSize(20); // Increased text size
      summaryDoc.setFont("helvetica", "bold"); // Bold text
      summaryDoc.setTextColor(255, 255, 255);
      summaryDoc.setFillColor(50, 52, 140); // #32348c
      summaryDoc.rect(0, 0, 210, 25, "F"); // Reduced height
      summaryDoc.text("SUMMARY REPORT", 105, 17, { align: "center" });

      summaryDoc.setFontSize(12);
      summaryDoc.setTextColor(50, 50, 50);
      summaryDoc.autoTable({
        head: [["S.No", "Date", "Particulars", "Amount"]],
        body: data.map((item, index) => [
          index + 1,
          item.date,
          item.particulars,
          item.amount,
        ]),
        startY: 30, // Adjusted to fit new header height
        headStyles: {
          fillColor: [50, 52, 140],
          textColor: 255,
          fontSize: 12,
          fontStyle: "bold",
        },
        bodyStyles: { textColor: 50, fontSize: 10 },
        theme: "grid",
        margin: { left: 10, right: 10 },
      });

      // Save the summary PDF
      const pdfBytes = summaryDoc.output("arraybuffer");
      const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "summary-report.pdf";
      link.click();
      URL.revokeObjectURL(url);
      handleClearSummary();

      // Show success Snackbar
      setSnackbarMessage("Summary PDF generated successfully.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setSnackbarMessage("Error generating Summary PDF.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleConsolidate = async () => {
    if (!validateConsolidateFields()) return;

    try {
      const fyYearName = consolidateFyYear.fy_name;
      const monthName = consolidateMonth.month_name;

      const data = await getFormsByFyYearAndMonth(fyYearName, monthName);
      console.log("Consolidation Data:", data);
      console.log(fyYearName, monthName);

      // Create a new PDF document for consolidation
      const pdfDoc = await PDFDocument.create();

      // Step 1: Generate the summary PDF in memory
      const summaryDoc = new jsPDF();

      // Add centered "Summary Report" title with background color and white text
      summaryDoc.setFontSize(20); // Increased text size
      summaryDoc.setFont("helvetica", "bold"); // Bold text
      summaryDoc.setTextColor(255, 255, 255);
      summaryDoc.setFillColor(50, 52, 140); // #32348c
      summaryDoc.rect(0, 0, 210, 25, "F"); // Reduced height
      summaryDoc.text("SUMMARY REPORT", 105, 17, { align: "center" });

      summaryDoc.setFontSize(12);
      summaryDoc.setTextColor(50, 50, 50);
      summaryDoc.autoTable({
        head: [["S.No", "Date", "Particulars", "Amount"]],
        body: data.map((item, index) => [
          index + 1,
          item.date,
          item.particulars,
          item.amount,
        ]),
        startY: 30, // Adjusted to fit new header height
        headStyles: {
          fillColor: [50, 52, 140],
          textColor: 255,
          fontSize: 12,
          fontStyle: "bold",
        },
        bodyStyles: { textColor: 50, fontSize: 10 },
        theme: "grid",
        margin: { left: 10, right: 10 },
      });

      // Convert the summary PDF to a byte array
      const summaryPdfBytes = summaryDoc.output("arraybuffer");

      // Load the summary PDF into pdf-lib
      const loadedSummaryPdf = await PDFDocument.load(summaryPdfBytes);

      // Copy pages from the summary PDF to the consolidated PDF
      const summaryPages = await pdfDoc.copyPages(
        loadedSummaryPdf,
        loadedSummaryPdf.getPageIndices()
      );
      summaryPages.forEach((page) => {
        pdfDoc.addPage(page);
      });

      // Step 2: Add additional PDF content after the summary
      for (let i = 0; i < data.length; i++) {
        const item = data[i];

        // Add a page break before each new entry
        if (i > 0) {
          pdfDoc.addPage();
        }

        // Create a new PDF page for the item
        const itemDoc = new jsPDF();

        // Add centered "CONSOLIDATE REPORT" title with background color and white text
        itemDoc.setFontSize(20); // Increased text size
        itemDoc.setFont("helvetica", "bold"); // Bold text
        itemDoc.setTextColor(255, 255, 255);
        itemDoc.setFillColor(50, 52, 140); // #32348c
        itemDoc.rect(0, 0, 210, 25, "F"); // Reduced height
        itemDoc.text(`CONSOLIDATE REPORT ${i + 1}`, 105, 17, {
          align: "center",
        });

        // Box Data with Improved UI
        const boxData = [
          ["Particulars:", item.particulars || "N/A"],
          ["Amount:", item.amount || "N/A"],
          ["Head Cat:", item.head_cat ? item.head_cat.head_cat_name : "N/A"],
          ["Sub Cat:", item.sub_cat ? item.sub_cat.sub_cat_name : "N/A"],
          [
            "Departments:",
            item.departments ? item.departments.dept_full_name : "N/A",
          ],
          ["Vehicles:", item.vehicles ? item.vehicles.vehicle_name : "N/A"],
        ];

        itemDoc.setFontSize(12);
        itemDoc.setTextColor(50, 50, 50);
        itemDoc.setFont("helvetica", "normal"); // Regular text for content

        // Center the box data on the page
        const pageWidth = 210;
        const boxWidth = 190;
        const boxHeight = 80; // Adjusted height
        const x = (pageWidth - boxWidth) / 2;
        const y = 30; // Starting Y position

        itemDoc.setFillColor(255, 255, 255); // No background
        itemDoc.rect(x, y, boxWidth, boxHeight, "F"); // Box background

        // Center the table within the box
        itemDoc.autoTable({
          body: boxData,
          startY: y + 10, // Space from the top of the box
          theme: "grid",
          styles: {
            cellPadding: 6,
            fontSize: 12,
            cellWidth: "auto",
            valign: "top",
          },
          headStyles: { fillColor: [50, 52, 140], textColor: 255 },
          bodyStyles: { textColor: 50 },
          margin: { left: x + 10, right: 10 }, // Center the table
          tableWidth: boxWidth - 20, // Adjust table to fit the box width with padding
        });

        // Convert the item PDF to a byte array
        const itemPdfBytes = itemDoc.output("arraybuffer");

        // Load the item PDF into pdf-lib
        const loadedItemPdf = await PDFDocument.load(itemPdfBytes);

        // Copy pages from the item PDF to the consolidated PDF
        const itemPages = await pdfDoc.copyPages(
          loadedItemPdf,
          loadedItemPdf.getPageIndices()
        );
        itemPages.forEach((page) => {
          pdfDoc.addPage(page);
        });

        // Fetch and attach the additional PDF if available
        const fileUrl = `http://localhost:1111/merged_pdfs/${item.files}`;
        const pdfBlob = await fetchPDF(fileUrl);

        if (pdfBlob) {
          const externalPdfDoc = await PDFDocument.load(
            await pdfBlob.arrayBuffer()
          );
          const externalPages = await pdfDoc.copyPages(
            externalPdfDoc,
            externalPdfDoc.getPageIndices()
          );

          // Add each page of the external PDF to the consolidated document
          externalPages.forEach((page) => {
            pdfDoc.addPage(page);
          });
        }
      }

      // Save the consolidated PDF
      const consolidatedPdfBytes = await pdfDoc.save();
      const consolidatedPdfBlob = new Blob([consolidatedPdfBytes], {
        type: "application/pdf",
      });
      const consolidatedUrl = URL.createObjectURL(consolidatedPdfBlob);
      const link = document.createElement("a");
      link.href = consolidatedUrl;
      link.download = "consolidated-report.pdf";
      link.click();
      URL.revokeObjectURL(consolidatedUrl);
      handleClearConsolidate();

      // Show success Snackbar
      setSnackbarMessage("Consolidation PDF generated successfully.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setSnackbarMessage("Error generating Consolidation PDF.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleClearSummary = () => {
    setSummaryFyYear(null);
    setSummaryMonth(null);
  };

  const handleClearConsolidate = () => {
    setConsolidateFyYear(null);
    setConsolidateMonth(null);
  };

  const filterDate = async()=>{
    const formattedFDate = fromDate ? format(new Date(fromDate),'dd-MM-yyyy') : '';
    const formattedTDate = toDate ? format(new Date(toDate),'dd-MM-yyyy') : '' ;
    console.log(formattedFDate + '' +formattedTDate);
    const date = await dateFilter(formattedFDate,formattedTDate);
    console.log(date);
  }

  return (
    <div>
      <Dash />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "30px",
          paddingTop: "100px",
          width: "100%",
          gap: "30px",
        }}
      >
        {/* Summary Box */}
        <Box
          p={2}
          bgcolor="background.paper"
          borderRadius="10px"
          sx={{
            height: "auto",
            width: "30%",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          }} // Adjusted width
        >
          <Typography
            variant="h4"
            sx={{
              color: "white",
              backgroundColor: "#32348c",
              padding: "10px",
              borderRadius: "50px",
              textAlign: "center",
            }}
          >
            <b>SUMMARY</b>
          </Typography>
          <Autocomplete
            style={{ marginTop: "20px" }}
            options={fyYearOptions}
            getOptionLabel={(option) => option.fy_name}
            value={summaryFyYear}
            onChange={(event, newValue) => setSummaryFyYear(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Fiscal Year"
                error={!!errors.summaryFyYear}
                helperText={errors.summaryFyYear || ""}
                sx={{ "&:hover": { backgroundColor: "#e0e0e0" } }}
              />
            )}
          />
          <Autocomplete
            style={{ marginTop: "15px" }}
            options={monthOptions}
            getOptionLabel={(option) => option.month_name}
            value={summaryMonth}
            onChange={(event, newValue) => setSummaryMonth(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Month"
                error={!!errors.summaryMonth}
                helperText={errors.summaryMonth || ""}
                sx={{ "&:hover": { backgroundColor: "#e0e0e0" } }}
              />
            )}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={generatePDF}
            style={{ width: "100%", marginTop: "10px", borderRadius: "50px" }}
          >
            SUMMARY
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleClearSummary}
            sx={{
              mt: 2,
              display: "block",
              borderRadius: "50px",
              width: "100%",
            }}
          >
            Clear
          </Button>
        </Box>

        {/* Consolidate Box */}
        <Box
          p={2}
          bgcolor="background.paper"
          borderRadius="10px"
          sx={{
            height: "auto",
            width: "30%",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          }} // Adjusted width
        >
          <Typography
            variant="h4"
            sx={{
              color: "white",
              backgroundColor: "#32348c",
              padding: "10px",
              borderRadius: "50px",
              textAlign: "center",
            }}
          >
            <b>CONSOLIDATE</b>
          </Typography>
          <Autocomplete
            style={{ marginTop: "20px" }}
            options={fyYearOptions}
            getOptionLabel={(option) => option.fy_name}
            value={consolidateFyYear}
            onChange={(event, newValue) => setConsolidateFyYear(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Fy  Year"
                error={!!errors.consolidateFyYear}
                helperText={errors.consolidateFyYear || ""}
                sx={{ "&:hover": { backgroundColor: "#e0e0e0" } }}
              />
            )}
          />
          <Autocomplete
            style={{ marginTop: "15px" }}
            options={monthOptions}
            getOptionLabel={(option) => option.month_name}
            value={consolidateMonth}
            onChange={(event, newValue) => setConsolidateMonth(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Month"
                error={!!errors.consolidateMonth}
                helperText={errors.consolidateMonth || ""}
                sx={{ "&:hover": { backgroundColor: "#e0e0e0" } }}
              />
            )}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleConsolidate}
            style={{ width: "100%", marginTop: "10px", borderRadius: "50px" }}
          >
            CONSOLIDATE
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleClearConsolidate}
            sx={{
              mt: 2,
              display: "block",
              width: "100%",
              borderRadius: "50px",
            }}
          >
            Clear
          </Button>
        </Box>

        {/* Filter */}
        <Box
          p={2}
          bgcolor="background.paper"
          borderRadius="10px"
          sx={{
            height: "auto",
            width: "30%",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          }} // Adjusted width
        >
          <Typography
            variant="h4"
            sx={{
              color: "white",
              backgroundColor: "#32348c",
              padding: "10px",
              borderRadius: "50px",
              textAlign: "center",
            }}
          >
            <b>FILTER</b>
          </Typography>
          <div  style={{ marginTop: "20px" }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} locale={enGB} >
            <DesktopDatePicker
              label="Date"
              format="dd/MM/yyyy"
              value={fromDate}
              onChange={(newValue) => setFromDate(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  sx={{ "&:hover": { backgroundColor: "#e0e0e0" } }}
                />
              )}
            />
          </LocalizationProvider>
          </div>
          <div style={{ marginTop: "15px" }} >
          <LocalizationProvider dateAdapter={AdapterDateFns} locale={enGB}>
            <DesktopDatePicker
              label="Date"
              format="dd/MM/yyyy"
              value={toDate}
              onChange={(newValue) => setToDate(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  sx={{ "&:hover": { backgroundColor: "#e0e0e0"} }}
                />
              )}
            />
          </LocalizationProvider>
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={filterDate}
            style={{ width: "100%", marginTop: "10px", borderRadius: "50px" }}
          >
            FILTER
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleClearConsolidate}
            sx={{
              mt: 2,
              display: "block",
              width: "100%",
              borderRadius: "50px",
            }}
          >
            Clear
          </Button>
        </Box>

      </div>
      <Snackbar
        open={snackbarOpen}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ConsolidateAndSummary;
