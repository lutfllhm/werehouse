const axios = require('axios');
const accurateService = require('../services/accurateService');
const tokenService = require('../services/tokenService');

// Generate OAuth Authorization URL
exports.getAuthUrl = (req, res) => {
  try {
    // Scope yang valid untuk Accurate Online OAuth
    // Referensi: https://accurate.id/api-myob/
    const scopes = [
      'item_view',
      'item_save',
      'sales_order_view',
      'sales_order_save',
      'customer_view'
    ];

    const authUrl = `https://account.accurate.id/oauth/authorize?` +
      `client_id=${process.env.ACCURATE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(process.env.ACCURATE_REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${scopes.join(' ')}`;

    console.log('Generated Auth URL:', authUrl);
    console.log('Client ID:', process.env.ACCURATE_CLIENT_ID);
    console.log('Redirect URI:', process.env.ACCURATE_REDIRECT_URI);

    res.json({
      success: true,
      authUrl
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal generate authorization URL'
    });
  }
};

// Redirect to Accurate OAuth (tanpa perlu token)
exports.redirectToAuth = (req, res) => {
  try {
    const scopes = [
      'item_view',
      'item_save',
      'sales_order_view',
      'sales_order_save',
      'customer_view'
    ];

    const authUrl = `https://account.accurate.id/oauth/authorize?` +
      `client_id=${process.env.ACCURATE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(process.env.ACCURATE_REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${scopes.join(' ')}`;

    console.log('Redirecting to Accurate OAuth:', authUrl);
    
    // Redirect langsung ke Accurate
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error redirecting to auth:', error);
    res.status(500).send('Gagal redirect ke Accurate OAuth');
  }
};

// Handle OAuth Callback
exports.handleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code tidak ditemukan'
      });
    }

    // Exchange code untuk access token
    const tokenResponse = await axios.post(
      'https://account.accurate.id/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.ACCURATE_CLIENT_ID,
        client_secret: process.env.ACCURATE_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.ACCURATE_REDIRECT_URI
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token, expires_in, token_type, scope } = tokenResponse.data;

    // Simpan token ke database
    // Untuk sementara gunakan user_id dari state atau default ke user yang login
    const userId = state || req.userData?.userId || 1; // Default ke user pertama jika tidak ada

    const saveResult = await tokenService.saveToken(userId, {
      access_token,
      refresh_token,
      expires_in,
      token_type,
      scope
    });

    if (!saveResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Gagal menyimpan token',
        error: saveResult.error
      });
    }

    // Redirect ke frontend dengan success message
    res.redirect(`${process.env.CORS_ORIGIN}/settings?accurate=connected`);

  } catch (error) {
    console.error('Error handling OAuth callback:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan access token',
      error: error.response?.data || error.message
    });
  }
};

// Refresh Access Token
exports.refreshToken = async (req, res) => {
  try {
    const userId = req.userData.userId;

    // Ambil token aktif
    const tokenResult = await tokenService.getActiveToken(userId);

    if (!tokenResult.success) {
      return res.status(400).json({
        success: false,
        message: tokenResult.message
      });
    }

    // Refresh token
    const tokenResponse = await axios.post(
      'https://account.accurate.id/oauth/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.ACCURATE_CLIENT_ID,
        client_secret: process.env.ACCURATE_CLIENT_SECRET,
        refresh_token: tokenResult.token.refreshToken
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token: new_refresh_token, expires_in } = tokenResponse.data;

    // Update token di database
    await tokenService.updateToken(tokenResult.token.id, {
      access_token,
      refresh_token: new_refresh_token,
      expires_in
    });

    res.json({
      success: true,
      message: 'Token berhasil di-refresh'
    });

  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal refresh token',
      error: error.response?.data || error.message
    });
  }
};

// Check Accurate API Status
exports.checkStatus = async (req, res) => {
  try {
    const userId = req.userData.userId;

    // Cek apakah user punya token aktif
    const hasToken = await tokenService.hasActiveToken(userId);

    if (!hasToken) {
      return res.json({
        success: true,
        connected: false,
        message: 'Belum terhubung dengan Accurate Online'
      });
    }

    // Ambil token
    const tokenResult = await tokenService.getActiveToken(userId);

    if (!tokenResult.success) {
      return res.json({
        success: true,
        connected: false,
        message: tokenResult.message
      });
    }

    // Test koneksi ke Accurate
    const response = await axios.get(
      'https://public-api.accurate.id/api/db-status.do',
      {
        headers: {
          'Authorization': `Bearer ${tokenResult.token.accessToken}`,
          'X-Api-Key': process.env.ACCURATE_DATABASE_ID
        }
      }
    );

    res.json({
      success: true,
      connected: true,
      data: response.data,
      tokenInfo: {
        expiresAt: tokenResult.token.expiresAt,
        scope: tokenResult.token.scope
      }
    });
  } catch (error) {
    console.error('Error checking status:', error.response?.data || error.message);
    res.json({
      success: true,
      connected: false,
      message: 'Gagal mengecek status koneksi',
      error: error.response?.data || error.message
    });
  }
};

// Disconnect from Accurate (revoke token)
exports.disconnect = async (req, res) => {
  try {
    const userId = req.userData.userId;

    const result = await tokenService.revokeToken(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Gagal disconnect dari Accurate',
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'Berhasil disconnect dari Accurate Online'
    });
  } catch (error) {
    console.error('Error disconnecting:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal disconnect dari Accurate'
    });
  }
};

// Get Available Databases
exports.getDatabases = async (req, res) => {
  try {
    const response = await axios.get(
      'https://public-api.accurate.id/api/db-list.do',
      {
        headers: {
          'Authorization': `Bearer ${process.env.ACCURATE_ACCESS_TOKEN}`
        }
      }
    );

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error getting databases:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil list database',
      error: error.response?.data || error.message
    });
  }
};

// Get API Token Info
exports.getApiTokenInfo = async (req, res) => {
  try {
    const userId = req.userData.userId;

    const result = await accurateService.getApiTokenInfo(userId);

    if (result.sukses) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.pesan,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting API token info:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil informasi API token'
    });
  }
};

// Get Items from Accurate
exports.getItems = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { page = 1, pageSize = 100, search } = req.query;

    const params = {
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    };

    if (search) {
      params.filter = `name.contains("${search}")`;
    }

    const result = await accurateService.getItems(userId, params);

    if (result.sukses) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.pesan,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting items:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data items'
    });
  }
};

// Get Item Detail
exports.getItemDetail = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { id } = req.params;

    const result = await accurateService.getItemDetail(userId, id);

    if (result.sukses) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.pesan,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting item detail:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail item'
    });
  }
};

// Get Item Stock
exports.getItemStock = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { id } = req.params;

    const result = await accurateService.getItemStock(userId, id);

    if (result.sukses) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.pesan,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting item stock:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil stock item'
    });
  }
};

// List Item Stock
exports.listItemStock = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { page = 1, pageSize = 100, warehouseId } = req.query;

    const params = {
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    };

    if (warehouseId) {
      params.warehouseId = warehouseId;
    }

    const result = await accurateService.listItemStock(userId, params);

    if (result.sukses) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.pesan,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error listing item stock:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil list stock'
    });
  }
};

// Save Item
exports.saveItem = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const itemData = req.body;

    const result = await accurateService.saveItem(userId, itemData);

    if (result.sukses) {
      res.json({
        success: true,
        message: 'Item berhasil disimpan',
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.pesan,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error saving item:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan item'
    });
  }
};

// Bulk Save Items
exports.bulkSaveItems = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const itemsArray = req.body;

    if (!Array.isArray(itemsArray)) {
      return res.status(400).json({
        success: false,
        message: 'Data harus berupa array'
      });
    }

    const result = await accurateService.bulkSaveItems(userId, itemsArray);

    if (result.sukses) {
      res.json({
        success: true,
        message: `${itemsArray.length} items berhasil disimpan`,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.pesan,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error bulk saving items:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal bulk save items'
    });
  }
};

// Delete Item
exports.deleteItem = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { id } = req.params;

    const result = await accurateService.deleteItem(userId, id);

    if (result.sukses) {
      res.json({
        success: true,
        message: 'Item berhasil dihapus',
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.pesan,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus item'
    });
  }
};

// Get Selling Price
exports.getSellingPrice = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { id } = req.params;
    const { customerId, quantity } = req.query;

    const params = {};
    if (customerId) params.customerId = customerId;
    if (quantity) params.quantity = quantity;

    const result = await accurateService.getSellingPrice(userId, id, params);

    if (result.sukses) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.pesan,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting selling price:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil selling price'
    });
  }
};

// Get Nearest Cost
exports.getNearestCost = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { id } = req.params;
    const { warehouseId, transDate } = req.query;

    const params = {};
    if (warehouseId) params.warehouseId = warehouseId;
    if (transDate) params.transDate = transDate;

    const result = await accurateService.getNearestCost(userId, id, params);

    if (result.sukses) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.pesan,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting nearest cost:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil nearest cost'
    });
  }
};

// Get Vendor Price
exports.getVendorPrice = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { id } = req.params;
    const { vendorId } = req.query;

    const params = {};
    if (vendorId) params.vendorId = vendorId;

    const result = await accurateService.getVendorPrice(userId, id, params);

    if (result.sukses) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.pesan,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting vendor price:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil vendor price'
    });
  }
};

// Search by Item or Serial Number
exports.searchByItemOrSN = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" diperlukan'
      });
    }

    const result = await accurateService.searchByItemOrSN(userId, q);

    if (result.sukses) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.pesan,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error searching item:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal search item'
    });
  }
};

// Search by UPC
exports.searchByNoUPC = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { upc } = req.query;

    if (!upc) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "upc" diperlukan'
      });
    }

    const result = await accurateService.searchByNoUPC(userId, upc);

    if (result.sukses) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.pesan,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error searching by UPC:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal search by UPC'
    });
  }
};

// Get Stock Mutation History
exports.getStockMutationHistory = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { id } = req.params;
    const { page = 1, pageSize = 100, dateFrom, dateTo } = req.query;

    const params = {
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    };

    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    const result = await accurateService.getStockMutationHistory(userId, id, params);

    if (result.sukses) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.pesan,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting stock mutation history:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil stock mutation history'
    });
  }
};

// Get Sales Orders from Accurate
exports.getSalesOrders = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { page = 1, pageSize = 100, status, dateFrom, dateTo } = req.query;

    const params = {
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    };

    // Filter berdasarkan status
    if (status) {
      params.filter = `status.eq("${status}")`;
    }

    // Filter berdasarkan tanggal
    if (dateFrom && dateTo) {
      const dateFilter = `transDate.between("${dateFrom}","${dateTo}")`;
      params.filter = params.filter 
        ? `${params.filter} and ${dateFilter}`
        : dateFilter;
    }

    const result = await accurateService.getSalesOrders(userId, params);

    if (result.sukses) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.pesan,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting sales orders:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data sales orders'
    });
  }
};

// Get Sales Order Detail
exports.getSalesOrderDetail = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { id } = req.params;

    const result = await accurateService.getSalesOrderDetail(userId, id);

    if (result.sukses) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.pesan,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting sales order detail:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail sales order'
    });
  }
};

// Save Sales Order
exports.saveSalesOrder = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const salesOrderData = req.body;

    const result = await accurateService.saveSalesOrder(userId, salesOrderData);

    if (result.sukses) {
      res.json({
        success: true,
        message: 'Sales order berhasil disimpan',
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.pesan,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error saving sales order:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan sales order'
    });
  }
};

// Bulk Save Sales Orders
exports.bulkSaveSalesOrders = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const salesOrdersArray = req.body;

    if (!Array.isArray(salesOrdersArray)) {
      return res.status(400).json({
        success: false,
        message: 'Data harus berupa array'
      });
    }

    const result = await accurateService.bulkSaveSalesOrders(userId, salesOrdersArray);

    if (result.sukses) {
      res.json({
        success: true,
        message: `${salesOrdersArray.length} sales orders berhasil disimpan`,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.pesan,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error bulk saving sales orders:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal bulk save sales orders'
    });
  }
};

// Delete Sales Order
exports.deleteSalesOrder = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { id } = req.params;

    const result = await accurateService.deleteSalesOrder(userId, id);

    if (result.sukses) {
      res.json({
        success: true,
        message: 'Sales order berhasil dihapus',
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.pesan,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error deleting sales order:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus sales order'
    });
  }
};

// Manual Close Sales Order
exports.manualCloseSalesOrder = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { id } = req.params;

    const result = await accurateService.manualCloseSalesOrder(userId, id);

    if (result.sukses) {
      res.json({
        success: true,
        message: 'Sales order berhasil di-close',
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.pesan,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error manual closing sales order:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal manual close sales order'
    });
  }
};
