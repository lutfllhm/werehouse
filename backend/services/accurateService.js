const axios = require('axios');
const crypto = require('crypto');
const tokenService = require('./tokenService');

class AccurateService {
  constructor() {
    this.accountURL = 'https://account.accurate.id';
    this.signatureSecret = process.env.ACCURATE_SIGNATURE_SECRET;
    this.hostCache = null;
    this.hostCacheTime = null;
  }

  // Generate timestamp untuk API
  generateTimestamp() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  // Generate signature HMAC SHA-256
  generateSignature(timestamp) {
    const hmac = crypto.createHmac('sha256', this.signatureSecret);
    hmac.update(timestamp);
    return hmac.digest('base64');
  }

  // Get host dinamis dari API Token
  async getHost(accessToken) {
    // Cache host selama 30 hari
    if (this.hostCache && this.hostCacheTime) {
      const daysSinceCache = (Date.now() - this.hostCacheTime) / (1000 * 60 * 60 * 24);
      if (daysSinceCache < 30) {
        return this.hostCache;
      }
    }

    try {
      const timestamp = this.generateTimestamp();
      const signature = this.generateSignature(timestamp);

      const response = await axios.post(
        `${this.accountURL}/api/api-token.do`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Api-Timestamp': timestamp,
            'X-Api-Signature': signature,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.s && response.data.d['data usaha']) {
        this.hostCache = response.data.d['data usaha'].host;
        this.hostCacheTime = Date.now();
        return this.hostCache;
      }

      throw new Error('Failed to get host from API token');
    } catch (error) {
      console.error('Error getting host:', error.message);
      throw error;
    }
  }

  // Konfigurasi header untuk API Accurate (dengan userId dari database)
  async getHeaders(userId) {
    // Ambil token dari database
    const tokenResult = await tokenService.getActiveToken(userId);
    
    if (!tokenResult.success) {
      throw new Error('Token tidak valid atau sudah expired');
    }

    const timestamp = this.generateTimestamp();
    const signature = this.generateSignature(timestamp);

    return {
      'Authorization': `Bearer ${tokenResult.token.accessToken}`,
      'X-Api-Timestamp': timestamp,
      'X-Api-Signature': signature,
      'Content-Type': 'application/json'
    };
  }

  // Konfigurasi header untuk API Accurate (fallback ke .env jika tidak ada userId)
  getHeadersFromEnv() {
    const timestamp = this.generateTimestamp();
    const signature = this.generateSignature(timestamp);

    return {
      'Authorization': `Bearer ${process.env.ACCURATE_ACCESS_TOKEN}`,
      'X-Api-Timestamp': timestamp,
      'X-Api-Signature': signature,
      'Content-Type': 'application/json'
    };
  }

  // Get base URL untuk API calls
  async getBaseURL(accessToken) {
    const host = await this.getHost(accessToken);
    return `${host}/accurate/api`;
  }

  // Ambil data items dari Accurate Online
  async getItems(userId, params = {}) {
    try {
      const tokenResult = await tokenService.getActiveToken(userId);
      if (!tokenResult.success) {
        throw new Error('Token tidak valid');
      }

      const baseURL = await this.getBaseURL(tokenResult.token.accessToken);
      const headers = await this.getHeaders(userId);
      
      // Menggunakan endpoint /list.do sesuai API Accurate
      const response = await axios.get(`${baseURL}/item/list.do`, {
        headers,
        params: {
          sp: params.page || 1,
          pageSize: params.pageSize || 100,
          ...params
        }
      });

      return {
        sukses: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error mengambil data items dari Accurate:', error.message);
      return {
        sukses: false,
        pesan: error.response?.data?.message || 'Gagal mengambil data items',
        error: error.message
      };
    }
  }

  // Ambil detail item berdasarkan ID
  async getItemDetail(userId, itemId) {
    try {
      const headers = await this.getHeaders(userId);
      
      // Menggunakan endpoint /detail.do sesuai API Accurate
      const response = await axios.get(`${this.baseURL}/item/detail.do`, {
        headers,
        params: { id: itemId }
      });

      return {
        sukses: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error mengambil detail item:', error.message);
      return {
        sukses: false,
        pesan: 'Gagal mengambil detail item',
        error: error.message
      };
    }
  }

  // Ambil stock item
  async getItemStock(userId, itemId) {
    try {
      const headers = await this.getHeaders(userId);
      const response = await axios.get(`${this.baseURL}/item/get-stock.do`, {
        headers,
        params: { id: itemId }
      });

      return {
        sukses: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error mengambil stock item:', error.message);
      return {
        sukses: false,
        pesan: 'Gagal mengambil stock item',
        error: error.message
      };
    }
  }

  // List stock items (all items with stock info)
  async listItemStock(userId, params = {}) {
    try {
      const headers = await this.getHeaders(userId);
      const response = await axios.get(`${this.baseURL}/item/list-stock.do`, {
        headers,
        params: {
          sp: params.page || 1,
          pageSize: params.pageSize || 100,
          ...params
        }
      });

      return {
        sukses: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error mengambil list stock:', error.message);
      return {
        sukses: false,
        pesan: 'Gagal mengambil list stock',
        error: error.message
      };
    }
  }

  // Save item
  async saveItem(userId, data) {
    try {
      const headers = await this.getHeaders(userId);
      const response = await axios.post(`${this.baseURL}/item/save.do`, data, {
        headers
      });

      return {
        sukses: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error menyimpan item:', error.message);
      return {
        sukses: false,
        pesan: 'Gagal menyimpan item',
        error: error.message
      };
    }
  }

  // Bulk save items
  async bulkSaveItems(userId, dataArray) {
    try {
      const headers = await this.getHeaders(userId);
      const response = await axios.post(`${this.baseURL}/item/bulk-save.do`, dataArray, {
        headers
      });

      return {
        sukses: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error bulk save items:', error.message);
      return {
        sukses: false,
        pesan: 'Gagal bulk save items',
        error: error.message
      };
    }
  }

  // Delete item
  async deleteItem(userId, itemId) {
    try {
      const headers = await this.getHeaders(userId);
      const response = await axios.delete(`${this.baseURL}/item/delete.do`, {
        headers,
        params: { id: itemId }
      });

      return {
        sukses: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error menghapus item:', error.message);
      return {
        sukses: false,
        pesan: 'Gagal menghapus item',
        error: error.message
      };
    }
  }

  // Get selling price
  async getSellingPrice(userId, itemId, params = {}) {
    try {
      const headers = await this.getHeaders(userId);
      const response = await axios.get(`${this.baseURL}/item/get-selling-price.do`, {
        headers,
        params: { id: itemId, ...params }
      });

      return {
        sukses: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error mengambil selling price:', error.message);
      return {
        sukses: false,
        pesan: 'Gagal mengambil selling price',
        error: error.message
      };
    }
  }

  // Get nearest cost
  async getNearestCost(userId, itemId, params = {}) {
    try {
      const headers = await this.getHeaders(userId);
      const response = await axios.get(`${this.baseURL}/item/get-nearest-cost.do`, {
        headers,
        params: { id: itemId, ...params }
      });

      return {
        sukses: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error mengambil nearest cost:', error.message);
      return {
        sukses: false,
        pesan: 'Gagal mengambil nearest cost',
        error: error.message
      };
    }
  }

  // Get vendor price
  async getVendorPrice(userId, itemId, params = {}) {
    try {
      const headers = await this.getHeaders(userId);
      const response = await axios.get(`${this.baseURL}/item/vendor-price.do`, {
        headers,
        params: { id: itemId, ...params }
      });

      return {
        sukses: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error mengambil vendor price:', error.message);
      return {
        sukses: false,
        pesan: 'Gagal mengambil vendor price',
        error: error.message
      };
    }
  }

  // Search by item or serial number
  async searchByItemOrSN(userId, searchTerm) {
    try {
      const headers = await this.getHeaders(userId);
      const response = await axios.get(`${this.baseURL}/item/search-by-item-or-sn.do`, {
        headers,
        params: { q: searchTerm }
      });

      return {
        sukses: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error search item:', error.message);
      return {
        sukses: false,
        pesan: 'Gagal search item',
        error: error.message
      };
    }
  }

  // Search by no UPC
  async searchByNoUPC(userId, upc) {
    try {
      const headers = await this.getHeaders(userId);
      const response = await axios.get(`${this.baseURL}/item/search-by-no-upc.do`, {
        headers,
        params: { upc: upc }
      });

      return {
        sukses: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error search by UPC:', error.message);
      return {
        sukses: false,
        pesan: 'Gagal search by UPC',
        error: error.message
      };
    }
  }

  // Get stock mutation history
  async getStockMutationHistory(userId, itemId, params = {}) {
    try {
      const headers = await this.getHeaders(userId);
      const response = await axios.get(`${this.baseURL}/item/stock-mutation-history.do`, {
        headers,
        params: { 
          id: itemId,
          sp: params.page || 1,
          pageSize: params.pageSize || 100,
          ...params
        }
      });

      return {
        sukses: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error mengambil stock mutation history:', error.message);
      return {
        sukses: false,
        pesan: 'Gagal mengambil stock mutation history',
        error: error.message
      };
    }
  }

  // Ambil data sales orders dari Accurate Online
  async getSalesOrders(userId, params = {}) {
    try {
      console.log('Getting sales orders for userId:', userId);
      
      const tokenResult = await tokenService.getActiveToken(userId);
      if (!tokenResult.success) {
        throw new Error('Token tidak valid');
      }

      const baseURL = await this.getBaseURL(tokenResult.token.accessToken);
      const headers = await this.getHeaders(userId);
      
      console.log('Request to Accurate API:', {
        url: `${baseURL}/sales-order/list.do`,
        params: {
          sp: params.page || 1,
          pageSize: params.pageSize || 100,
          ...params
        }
      });
      
      // Menggunakan endpoint /list.do sesuai API Accurate
      const response = await axios.get(`${baseURL}/sales-order/list.do`, {
        headers,
        params: {
          sp: params.page || 1,
          pageSize: params.pageSize || 100,
          ...params
        }
      });

      console.log('Accurate API response status:', response.status);
      console.log('Accurate API response data keys:', Object.keys(response.data));

      return {
        sukses: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error mengambil data sales orders dari Accurate:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      return {
        sukses: false,
        pesan: error.response?.data?.message || error.response?.data?.error || 'Gagal mengambil data sales orders',
        error: error.message,
        statusCode: error.response?.status,
        detail: error.response?.data
      };
    }
  }

  // Ambil detail sales order berdasarkan ID
  async getSalesOrderDetail(userId, soId) {
    try {
      const headers = await this.getHeaders(userId);
      
      // Menggunakan endpoint /detail.do sesuai API Accurate
      const response = await axios.get(`${this.baseURL}/sales-order/detail.do`, {
        headers,
        params: { id: soId }
      });

      return {
        sukses: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error mengambil detail sales order:', error.message);
      return {
        sukses: false,
        pesan: 'Gagal mengambil detail sales order',
        error: error.message
      };
    }
  }

  // Save sales order
  async saveSalesOrder(userId, data) {
    try {
      const headers = await this.getHeaders(userId);
      const response = await axios.post(`${this.baseURL}/sales-order/save.do`, data, {
        headers
      });

      return {
        sukses: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error menyimpan sales order:', error.message);
      return {
        sukses: false,
        pesan: 'Gagal menyimpan sales order',
        error: error.message
      };
    }
  }

  // Bulk save sales orders
  async bulkSaveSalesOrders(userId, dataArray) {
    try {
      const headers = await this.getHeaders(userId);
      const response = await axios.post(`${this.baseURL}/sales-order/bulk-save.do`, dataArray, {
        headers
      });

      return {
        sukses: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error bulk save sales orders:', error.message);
      return {
        sukses: false,
        pesan: 'Gagal bulk save sales orders',
        error: error.message
      };
    }
  }

  // Delete sales order
  async deleteSalesOrder(userId, soId) {
    try {
      const headers = await this.getHeaders(userId);
      const response = await axios.delete(`${this.baseURL}/sales-order/delete.do`, {
        headers,
        params: { id: soId }
      });

      return {
        sukses: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error menghapus sales order:', error.message);
      return {
        sukses: false,
        pesan: 'Gagal menghapus sales order',
        error: error.message
      };
    }
  }

  // Manual close sales order
  async manualCloseSalesOrder(userId, soId) {
    try {
      const headers = await this.getHeaders(userId);
      const response = await axios.post(`${this.baseURL}/sales-order/manual-close-order.do`, 
        { id: soId },
        { headers }
      );

      return {
        sukses: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error manual close sales order:', error.message);
      return {
        sukses: false,
        pesan: 'Gagal manual close sales order',
        error: error.message
      };
    }
  }
}

module.exports = new AccurateService();
