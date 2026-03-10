import api from './api';

export const getSeasonPlan = async (data) => {
  try {
    const response = await api.post('/planning/plan', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
