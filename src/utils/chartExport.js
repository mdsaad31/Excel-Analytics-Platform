import html2canvas from 'html2canvas';
import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import NotificationUtil from './notificationUtil';

/**
 * Export chart as PNG image
 * @param {string} elementId - ID of the chart container element
 * @param {string} fileName - Name for the downloaded file (without extension)
 * @param {string} userId - User ID for notifications
 * @returns {Promise<void>}
 */
export const exportChartAsPNG = async (elementId, fileName = 'chart', userId = null) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      filter: (node) => {
        return node.tagName !== 'I' && !node.classList?.contains('recharts-tooltip');
      }
    });

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Send download notification
    if (userId) {
      await NotificationUtil.sendChartDownloadNotification(userId, fileName, 'PNG');
    }
  } catch (error) {
    console.error('Error exporting chart as PNG:', error);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        useCORS: true,
        foreignObjectRendering: true
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (fallbackError) {
      console.error('Fallback export also failed:', fallbackError);
      throw new Error('Both primary and fallback export methods failed');
    }
  }
};

/**
 * Export chart as PDF document
 * @param {string} elementId - ID of the chart container element
 * @param {string} fileName - Name for the downloaded file (without extension)
 * @param {Object} options - PDF options (orientation, title)
 * @returns {Promise<void>}
 */
export const exportChartAsPDF = async (elementId, fileName = 'chart', options = {}) => {
  try {
    const { orientation = 'landscape', title = 'Chart Export', userId = null } = options;
    
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      filter: (node) => {
        return node.tagName !== 'I' && !node.classList?.contains('recharts-tooltip');
      }
    });
    
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
    });
    
    pdf.setFontSize(16);
    pdf.text(title, 15, 15);
    
    const img = new Image();
    img.src = dataUrl;
    
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth() - 30;
    const pdfHeight = (img.height * pdfWidth) / img.width;
    
    pdf.addImage(dataUrl, 'PNG', 15, 25, pdfWidth, pdfHeight);
    
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 15, pdfHeight + 35);
    
    pdf.save(`${fileName}.pdf`);

    // Send download notification
    if (userId) {
      await NotificationUtil.sendChartDownloadNotification(userId, fileName, 'PDF');
    }
  } catch (error) {
    console.error('Error exporting chart as PDF:', error);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        useCORS: true,
        foreignObjectRendering: true
      });

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
      });
      
      pdf.setFontSize(16);
      pdf.text(title, 15, 15);
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 30;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 15, 25, pdfWidth, pdfHeight);
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 15, pdfHeight + 35);
      pdf.save(`${fileName}.pdf`);

      // Send download notification
      if (userId) {
        await NotificationUtil.sendChartDownloadNotification(userId, fileName, 'PDF');
      }
    } catch (fallbackError) {
      console.error('Fallback export also failed:', fallbackError);
      throw new Error('Both primary and fallback export methods failed');
    }
  }
};

/**
 * Generate unique element ID for chart export
 * @returns {string} Unique ID
 */
export const generateChartId = () => {
  return `chart-${Math.random().toString(36).substring(2, 9)}`;
};