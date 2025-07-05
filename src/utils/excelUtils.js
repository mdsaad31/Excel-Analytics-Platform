/**
 * Utility functions for Excel data processing
 */

/**
 * Format a number value based on its magnitude and type
 * @param {number|string} value - The value to format
 * @param {string} type - Optional type hint (currency, percent, etc)
 * @returns {string} - Formatted value as string
 */
export const formatValue = (value, type = 'number') => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return value;
  }
  
  switch (type.toLowerCase()) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numValue);
      
    case 'percent':
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
      }).format(numValue / 100);
      
    case 'number':
    default:
      if (Math.abs(numValue) >= 1000000) {
        return `${(numValue / 1000000).toFixed(1)}M`;
      } else if (Math.abs(numValue) >= 1000) {
        return `${(numValue / 1000).toFixed(1)}K`;
      } else if (Number.isInteger(numValue)) {
        return numValue.toString();
      } else {
        return numValue.toFixed(2);
      }
  }
};

/**
 * Detect column data types from a sample of data
 * @param {Array} data - Array of objects (rows)
 * @returns {Object} - Mapping of column names to detected types
 */
export const detectColumnTypes = (data) => {
  if (!data || !data.length) return {};
  
  const sample = data.slice(0, 100);
  const firstRow = data[0];
  const columnTypes = {};
  
  Object.keys(firstRow).forEach(column => {
    const values = sample
      .map(row => row[column])
      .filter(val => val !== null && val !== undefined && val !== '');
    
    if (!values.length) {
      columnTypes[column] = 'unknown';
      return;
    }
    
    const numericValues = values.filter(val => !isNaN(parseFloat(val)) && isFinite(val));
    if (numericValues.length === values.length) {
      const stringValues = values.map(v => String(v));
      if (stringValues.some(v => v.includes('%'))) {
        columnTypes[column] = 'percent';
      } else if (stringValues.some(v => v.includes('$') || v.includes('€') || v.includes('£'))) {
        columnTypes[column] = 'currency';
      } else {
        columnTypes[column] = 'number';
      }
      return;
    }
    
    const potentialDates = values.filter(val => !isNaN(Date.parse(val)));
    if (potentialDates.length === values.length) {
      columnTypes[column] = 'date';
      return;
    }
    
    columnTypes[column] = 'text';
  });
  
  return columnTypes;
};

/**
 * Get recommended chart types based on the data structure
 * @param {Array} data - The dataset
 * @param {Object} columnTypes - Column type mapping
 * @returns {Array} - Array of recommended chart types
 */
export const getRecommendedChartTypes = (data, columnTypes) => {
  if (!data || !data.length || !columnTypes) return ['bar']; // Default
  
  const numericColumns = Object.entries(columnTypes)
    .filter(([_, type]) => ['number', 'currency', 'percent'].includes(type))
    .map(([col, _]) => col);
  
  const categoryColumns = Object.entries(columnTypes)
    .filter(([_, type]) => ['text', 'date'].includes(type))
    .map(([col, _]) => col);
  
  const recommendations = [];
  
  if (numericColumns.length >= 1 && categoryColumns.length >= 1) {
    recommendations.push('bar', 'line');
    
    if (Object.values(columnTypes).includes('date')) {
      recommendations.push('area');
    }
  }
  
  if (numericColumns.length >= 2) {
    recommendations.push('scatter');
  }
  
  if (numericColumns.length === 1 && categoryColumns.length === 1) {
    recommendations.push('pie');
  }
  
  if (numericColumns.length >= 3) {
    recommendations.push('radar');
  }
  
  return [...new Set(recommendations)].length ? [...new Set(recommendations)] : ['bar'];
};