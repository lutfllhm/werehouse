// Format tanggal
export const formatTanggal = (tanggal, formatStr = 'dd MMM yyyy') => {
  if (!tanggal) return '-';
  try {
    const date = new Date(tanggal);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    if (formatStr === 'dd MMM yyyy') {
      const day = String(date.getDate()).padStart(2, '0');
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } else if (formatStr === 'dd/MM/yyyy HH:mm') {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } else if (formatStr === 'dd MMM yyyy HH:mm') {
      const day = String(date.getDate()).padStart(2, '0');
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day} ${month} ${year} ${hours}:${minutes}`;
    }
    return date.toLocaleDateString('id-ID');
  } catch (error) {
    return '-';
  }
};

// Format angka ke rupiah
export const formatRupiah = (angka) => {
  if (!angka) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka);
};

// Format angka biasa
export const formatAngka = (angka) => {
  if (!angka) return '0';
  return new Intl.NumberFormat('id-ID').format(angka);
};

// Get status color
export const getStatusColor = (status) => {
  switch (status) {
    case 'Terproses':
      return 'status-terproses';
    case 'Sebagian Terproses':
      return 'status-sebagian';
    case 'Menunggu Proses':
      return 'status-menunggu';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Download CSV
export const downloadCSV = (data, filename) => {
  const blob = new Blob([data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
