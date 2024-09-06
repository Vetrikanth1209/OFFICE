import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Container, Box, Card, CardContent, Button, FormControl, TextField, Switch } from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import Dash from './dash';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'; 

export const Admin = () => {
  const [selectedFyYear, setSelectedFyYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [isFyYearActive, setIsFyYearActive] = useState(false);
  const [isMonthActive, setIsMonthActive] = useState(false);
  const [cardsData, setCardsData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:1111/getmonth')
      .then(response => {
        setCardsData(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  // Fetch the FY year status when a year is selected
  useEffect(() => {
    if (selectedFyYear) {
      axios.get(`http://localhost:1111/getfy_year?fy_name=${selectedFyYear.getFullYear()}`)
        .then(response => {
          setIsFyYearActive(response.data.fy_id); // Set the switch state based on fetched data
        })
        .catch(error => {
          console.error('Error fetching FY year status:', error);
        });
    } else {
      setIsFyYearActive(false); // Reset switch state if no year is selected
    }
  }, [selectedFyYear]);

  // Fetch the month status when a month is selected
  useEffect(() => {
    if (selectedMonth) {
      axios.get(`http://localhost:1111/getmonth?month_name=${selectedMonth.toLocaleString('default', { month: 'long' })}`)
        .then(response => {
          setIsMonthActive(response.data.month_id); // Set the switch state based on fetched data
        })
        .catch(error => {
          console.error('Error fetching month status:', error);
        });
    } else {
      setIsMonthActive(false); // Reset switch state if no month is selected
    }
  }, [selectedMonth]);

  const handleFyYearChange = (newValue) => {
    setSelectedFyYear(newValue);
  };

  const handleMonthChange = (newValue) => {
    setSelectedMonth(newValue);
  };

  const handleFyYearToggle = async () => {
    if (!selectedFyYear) return;

    const newStatus = !isFyYearActive;
    setIsFyYearActive(newStatus);

    try {
      const url = newStatus
        ? 'http://localhost:1111/settruefyyear'
        : 'http://localhost:1111/setfalsefyyear';

      await axios.post(url, { fy_name: selectedFyYear.getFullYear() });
    } catch (error) {
      console.error('Error updating FY year status:', error);
    }
  };

  const handleMonthToggle = async () => {
    if (!selectedMonth) return;

    const newStatus = !isMonthActive;
    setIsMonthActive(newStatus);

    try {
      const url = newStatus
        ? 'http://localhost:1111/setmonthtrue'
        : 'http://localhost:1111/setmonthfalse';

      await axios.post(url, { month_name: selectedMonth.toLocaleString('default', { month: 'long' }) });
    } catch (error) {
      console.error('Error updating month status:', error);
    }
  };

  return (
    <div>
      <Dash />
      <Container sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', marginBottom: '50px' }}>
        <Box mt={5} p={3} boxShadow={3} borderRadius={5} sx={{ backgroundColor: 'white', width: '80vw', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ color: 'white', backgroundColor: '#32348c', padding: '10px', borderRadius: '5px', textAlign: 'center', width: '100%' }}><b>ADMIN</b></Typography>

          <Box sx={{ width: '100%', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <Card sx={{ width: '48%' }}>
              <CardContent>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <FormControl sx={{ marginTop: 0, width: '100%' }}>
                    <DesktopDatePicker
                      views={['year']}
                      label="Financial Year"
                      value={selectedFyYear}
                      onChange={handleFyYearChange}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </FormControl>
                </LocalizationProvider>
                <Switch
                  checked={isFyYearActive}
                  onChange={handleFyYearToggle}
                  disabled={!selectedFyYear}
                />
              </CardContent>
            </Card>
            <Card sx={{ width: '48%' }}>
              <CardContent>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <FormControl sx={{ marginTop: 0, width: '100%' }}>
                    <DesktopDatePicker
                      views={['month']}
                      label="Month"
                      value={selectedMonth}
                      onChange={handleMonthChange}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </FormControl>
                </LocalizationProvider>
                <Switch
                  checked={isMonthActive}
                  onChange={handleMonthToggle}
                  disabled={!selectedMonth}
                />
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {cardsData.map((month, index) => (
              <Card key={index} sx={{ width: '12%', marginBottom: '20px', marginLeft: '20px', marginRight: '10px', height: "5vh", textAlign: 'center', backgroundColor: month.month_id === 0 ? '#e91e63' : month.month_id === 1 ? '#00a67d' : 'white' }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'white' }}>{month.month_name}</CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Container>
    </div>
  );
};
