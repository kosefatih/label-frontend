import axios from 'axios';

const API_URL = 'https://localhost:7000/api';

export const getCustomers = async () => {
  const res = await axios.get(`${API_URL}/customers`);
  return res.data.data;
};

export const getProjects = async (customerCode) => {
  const res = await axios.get(`${API_URL}/customers/${customerCode}/projects`);
  return res.data.data;
};

export const getPanos = async (customerCode, projectCode) => {
  const res = await axios.get(`${API_URL}/customers/${customerCode}/projects/${projectCode}/panos`);
  return res.data.data;
};

export const getLabels = async (customerCode, projectCode, panoName) => {
  const res = await axios.get(`${API_URL}/customers/${customerCode}/projects/${projectCode}/panos/${panoName}/labels`);
  return res.data.data;
};

// lib/api.js
export const uploadExcel = async (person, customerCode, projectCode, panoName, file, descModel) => {
  const formData = new FormData();
  
  // Dosya ve temel bilgiler
  formData.append('file', file);
  formData.append('person', person);
  formData.append('customerName', customerCode);
  formData.append('projectName', projectCode);
  formData.append('panoName', panoName);
  
  // Complex modeli JSON olarak ekle
  formData.append('columnInfo', JSON.stringify(descModel));

  try {
    const response = await axios.post(
      `${API_URL}/customers/${customerCode}/projects/${projectCode}/panos/${panoName}/labels`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const getRuleSets = async () => {
  const res = await axios.get(`${API_URL}/settings/label_manipulation_module/params/rulesets`);
  return res.data.data;
};

export const applyRuleToLabel = async (customerCode, projectCode, panoName, listName, ruleSetId, ignoreException) => {
  const res = await axios.post(
    `${API_URL}/customers/${customerCode}/projects/${projectCode}/panos/${panoName}/labels/${listName}/`,
    null,
    {
      params: {
        RuleSetId: ruleSetId,
        IgnoreException: ignoreException
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return res.data;
};

// Manipüle edilmiş listeleri getir
export const getManipulatedLabels = async (customerCode, projectCode, panoName, listName) => {
  const res = await axios.get(
    `${API_URL}/customers/${customerCode}/projects/${projectCode}/panos/${panoName}/labels/${listName}/manipulated`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return res.data.data;
};

// Excel dosyasını export et
export const exportLabelList = async (customerCode, projectCode, panoName, listName, labelType, applyedListName, settings) => {
  const res = await axios.post(
    `${API_URL}/customers/${customerCode}/projects/${projectCode}/panos/${panoName}/labels/${listName}/export/${labelType}/${applyedListName}`,
    settings,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      responseType: 'blob' // Binary response almak için
    }
  );
  return res;
};

// Müşteri işlemleri
export const createCustomer = async (customerData) => {
  const res = await axios.post(`${API_URL}/customers`, customerData, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return res.data;
};

// Proje işlemleri
export const createProject = async (customerCode, projectData) => {
  const res = await axios.post(`${API_URL}/customers/${customerCode}/projects`, projectData, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return res.data;
};

// Pano işlemleri
export const createPano = async (customerCode, projectCode, panoData) => {
  const res = await axios.post(`${API_URL}/customers/${customerCode}/projects/${projectCode}/panos`, panoData, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return res.data;
};