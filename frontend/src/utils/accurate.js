import api from './api';

// Get Accurate OAuth Authorization URL
export const getAccurateAuthUrl = async () => {
  try {
    const response = await api.get('/accurate/auth/url');
    return response.data;
  } catch (error) {
    console.error('Error getting auth URL:', error);
    throw error;
  }
};

// Check Accurate connection status
export const checkAccurateStatus = async () => {
  try {
    const response = await api.get('/accurate/status');
    return response.data;
  } catch (error) {
    console.error('Error checking status:', error);
    throw error;
  }
};

// Disconnect from Accurate
export const disconnectAccurate = async () => {
  try {
    const response = await api.post('/accurate/disconnect');
    return response.data;
  } catch (error) {
    console.error('Error disconnecting:', error);
    throw error;
  }
};

// Refresh Accurate token
export const refreshAccurateToken = async () => {
  try {
    const response = await api.post('/accurate/refresh-token');
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};
