// test file

import axios from 'axios';

export const fetchHospitalInfo = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/hospital-info');
    return response.data;
  } catch (error) {
    throw error;
  }
};