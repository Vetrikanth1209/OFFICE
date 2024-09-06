import axios from 'axios';



// POST SIGN IN

export const postsignin = (userData) => {
  return axios.post("http://localhost:1111/signin", userData);
};


// POST REPORT OR FORM

export const postform = async (formData, files) => {
  try {
    const data = new FormData();

    // Append form fields
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        data.append(key, formData[key]);
      }
    }

    // Append files
    files.forEach((file) => {
      data.append('files', file);
    });

    // Post form data to the server
    const response = await axios.post('http://localhost:1111/postform', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error posting form:', error);
    throw error;
  }
};

export const getHeadCat = async () => {
  const response = await axios.get('http://localhost:1111/gethead_cat');
  return response.data;
};

export const getSubCat = async () => {
  const response = await axios.get('http://localhost:1111/getsub_cat');
  return response.data;
};

export const getMonth = async () => {
  const response = await axios.get('http://localhost:1111/getmonth');
  return response.data;
};

export const getDepartment = async () => {
  const response = await axios.get('http://localhost:1111/getdepartment');
  return response.data;
};

export const getEmployee = async () => {
  const response = await axios.get('http://localhost:1111/getemployee');
  return response.data;
};

export const getVehicle = async () => {
  const response = await axios.get('http://localhost:1111/getvehicle');
  return response.data;
};

export const getFyYear = async () => {
  const response = await axios.get('http://localhost:1111/getfy_year');
  return response.data;
};

export const getforms = async () => {
  try {
    const response = await axios.get('http://localhost:1111/getforms');
    const data = response.data;

    // Reverse the data array so that the last item comes first
    const reversedData = data.reverse();

    return reversedData;
  } catch (error) {
    console.error('Error fetching forms:', error);
    throw error;
  }
};


// Function to get forms by amount
export const getFormsByAmount = async (amount) => {
  try {
    const response = await axios.get(`http://localhost:1111/amount/${amount}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching forms by amount:', error);
    throw error;
  }
};

// Function to get forms by particulars
export const getFormsByParticulars = async (particulars) => {
  try {
    const response = await axios.get(`http://localhost:1111/particulars/${particulars}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching forms by particulars:', error);
    throw error;
  }
};

// Function to get forms by fiscal year
export const getFormsByFyYear = async (fyYear) => {
  try {
    const response = await axios.get(`http://localhost:1111/fy_year/${fyYear}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching forms by fiscal year:', error);
    throw error;
  }
};

// Function to get forms by month
export const getFormsByMonth = async (month) => {
  try {
    const response = await axios.get(`http://localhost:1111/month/${month}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching forms by month:', error);
    throw error;
  }
};

// Function to get forms by date
export const getFormsByDate = async (date) => {
  try {
    const response = await axios.get(`http://localhost:1111/date/${date}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching forms by date:', error);
    throw error;
  }
};

// Function to get forms by head category name
export const getFormsByHeadCatName = async (headCatName) => {
  try {
    const response = await axios.get(`http://localhost:1111/getFormByHeadCatName/${headCatName}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching forms by head category name:', error);
    throw error;
  }
};

// Function to get forms by subcategory name
export const getFormsBySubCatName = async (subCatName) => {
  try {
    const response = await axios.get(`http://localhost:1111/getFormBySubCatName/${subCatName}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching forms by subcategory name:', error);
    throw error;
  }
};

// Function to get forms by vehicle ID
export const getFormsByVehicleID = async (vehicleID) => {
  try {
    const response = await axios.get(`http://localhost:1111/getFormByVehicleID/${vehicleID}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching forms by vehicle ID:', error);
    throw error;
  }
};

// Function to get forms by employee ID
export const getFormsByEmployeeID = async (empID) => {
  try {
    const response = await axios.get(`http://localhost:1111/getFormByEmployeeID/${empID}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching forms by employee ID:', error);
    throw error;
  }
};

// GET FORM DATA BY FY YEAR AND MONTH 

export const getFormsByFyYearAndMonth = async (fy_year, month) => {
  try {
    const response = await axios.get(`http://localhost:1111/fy_year_month/${fy_year}/${month}`);
    return response.data;
  } catch (error) {
    console.error('Failed to retrieve forms', error);
    throw error;
  }
};

// Fetch financial year options
export const getFyYearOptions = async () => {
  try {
    const response = await axios.get('http://localhost:1111/getfyyearoption');
    return response.data;
  } catch (error) {
    console.error('Error fetching financial year options:', error);
    throw error;
  }
};

// Fetch month options CS
export const getMonthOptions = async () => {
  try {
    const response = await axios.get('http://localhost:1111/getmonthoption');
    return response.data;
  } catch (error) {
    console.error('Error fetching month options:', error);
    throw error;
  }
};

// Fetch month data
export const fetchMonthData = () => {
  return axios.get(`http://localhost:1111/getmonth`);
};

// Get financial year status
export const getFyYearStatus = (fyName) => {
  return axios.get(`http://localhost:1111/getfy_year`, {
    params: { fy_name: fyName }
  });
};

// Get month status
export const getMonthStatus = (monthName) => {
  return axios.get(`http://localhost:1111/getmonth`, {
    params: { month_name: monthName }
  });
};

// Activate financial year
export const activateFyYear = (fyName) => {
  return axios.post(`http://localhost:1111/settruefyyear`, { fy_name: fyName });
};

// Lock financial year
export const lockFyYear = (fyName) => {
  return axios.post(`http://localhost:1111/setfalsefyyear`, { fy_name: fyName });
};

// Activate month
export const activateMonth = (monthName) => {
  return axios.post(`http://localhost:1111/setmonthtrue`, { month_name: monthName });
};

// Lock month
export const lockMonth = (monthName) => {
  return axios.post(`http://localhost:1111/setmonthfalse`, { month_name: monthName });
};
