import { read, utils } from 'xlsx';

/**
 * Parse Excel file and return data as JSON
 * @param {File} file - Excel file to parse
 * @returns {Promise<{sheets: Object, headers: Object, firstSheet: string}>}
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = read(data, { type: 'array' });
        
        const sheetNames = workbook.SheetNames;
        
        if (sheetNames.length === 0) {
          reject(new Error('No sheets found in the Excel file.'));
          return;
        }
        
        const sheets = {};
        const headers = {};
        
        sheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = utils.sheet_to_json(worksheet);
          
          sheets[sheetName] = jsonData;
          
          if (jsonData.length > 0) {
            headers[sheetName] = Object.keys(jsonData[0]);
          } else {
            headers[sheetName] = [];
          }
        });
        
        resolve({
          sheets,
          headers,
          firstSheet: sheetNames[0]
        });
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read the file.'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Get statistical summary of numerical columns in the data
 * @param {Array} data
 * @returns {Object}
 */
export const getDataSummary = (data) => {
  if (!data || data.length === 0) {
    return {};
  }

  const summary = {};
  
  const keys = Object.keys(data[0]);
  
  keys.forEach(key => {
    const values = data.map(d => d[key]).filter(val => 
      !isNaN(parseFloat(val)) && isFinite(val)
    );
    
    if (values.length > 0) {
      const numericValues = values.map(v => parseFloat(v));
      
      const sum = numericValues.reduce((acc, val) => acc + val, 0);
      const mean = sum / numericValues.length;
      
      const sorted = [...numericValues].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      
      summary[key] = {
        count: numericValues.length,
        min,
        max,
        sum,
        mean,
        median
      };
    }
  });
  
  return summary;
};