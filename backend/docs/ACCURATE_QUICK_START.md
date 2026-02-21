# Accurate Online API - Quick Start Guide

Panduan cepat untuk menggunakan Accurate Online API dengan API Token.

## Setup (5 menit)

### 1. Dapatkan API Token

1. Login ke https://account.accurate.id
2. Buka menu **Developer** → **API Token**
3. Klik **Create New Token**
4. Copy **API Token** dan **Signature Secret**

### 2. Konfigurasi Environment

Edit file `backend/.env`:

```env
ACCURATE_ACCESS_TOKEN=aat.MTUw.eyJ2IjoxLCJ1Ijo1MDAsImQiOjIwNTYs...
ACCURATE_SIGNATURE_SECRET=31d49b3dc632614495ff8071e5be44a1
```

### 3. Test Koneksi

```bash
cd backend
node scripts/testApiToken.js
```

Jika berhasil, Anda akan melihat:
```
✓ Timestamp generation: OK
✓ HMAC SHA-256 signature: OK
✓ API Token authentication: OK
✓ Dynamic host retrieval: OK
✓ Host caching (30 days): OK
✓ Request headers: OK
✓ API calls with redirect support: OK
```

## Penggunaan Dasar

### Get Items

```javascript
const accurateService = require('./services/accurateService');

// List all items
const result = await accurateService.getItems(userId, {
  page: 1,
  pageSize: 100
});

if (result.sukses) {
  console.log('Items:', result.data.d);
  console.log('Total:', result.data.sp.rowCount);
}
```

### Get Item Detail

```javascript
const result = await accurateService.getItemDetail(userId, itemId);

if (result.sukses) {
  console.log('Item:', result.data.r);
}
```

### Create Item

```javascript
const itemData = {
  name: "Product Name",
  itemType: "INVENTORY",
  itemCategoryName: "Umum",
  unit1Name: "PCS",
  unitPrice: 100000
};

const result = await accurateService.saveItem(userId, itemData);

if (result.sukses) {
  console.log('Item created:', result.data.r);
}
```

### Get Sales Orders

```javascript
const result = await accurateService.getSalesOrders(userId, {
  page: 1,
  pageSize: 100,
  status: 'OPEN' // Optional filter
});

if (result.sukses) {
  console.log('Sales Orders:', result.data.d);
}
```

## API Endpoints

### Items

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accurate/items` | List items |
| GET | `/api/accurate/items/:id` | Get item detail |
| GET | `/api/accurate/items/:id/stock` | Get item stock |
| POST | `/api/accurate/items` | Create/update item |
| DELETE | `/api/accurate/items/:id` | Delete item |

### Sales Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accurate/sales-orders` | List sales orders |
| GET | `/api/accurate/sales-orders/:id` | Get order detail |
| POST | `/api/accurate/sales-orders` | Create/update order |
| DELETE | `/api/accurate/sales-orders/:id` | Delete order |

### Token Info

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accurate/token-info` | Get API token info |
| GET | `/api/accurate/status` | Check connection status |

## Request Headers

Semua request ke Accurate API memerlukan 3 headers:

```
Authorization: Bearer {API_TOKEN}
X-Api-Timestamp: {TIMESTAMP}
X-Api-Signature: {HMAC_SHA256_SIGNATURE}
```

Headers ini di-generate otomatis oleh `accurateService`.

## Error Handling

```javascript
const result = await accurateService.getItems(userId);

if (result.sukses) {
  // Success
  console.log('Data:', result.data);
} else {
  // Error
  console.error('Error:', result.pesan);
  console.error('Details:', result.error);
}
```

## Common Errors

| Error | Solusi |
|-------|--------|
| `Token tidak valid` | Periksa ACCURATE_ACCESS_TOKEN di .env |
| `Header X-Api-Signature invalid` | Periksa ACCURATE_SIGNATURE_SECRET di .env |
| `Timestamp difference more than 600 seconds` | Pastikan waktu server benar |
| `Failed to get host` | Periksa koneksi internet |

## Rate Limits

- **8 API calls per second**
- **8 parallel processes**

Jika melebihi limit, tunggu 1 detik sebelum request berikutnya.

## Tips

1. **Cache Data**: Simpan data yang jarang berubah di database lokal
2. **Batch Operations**: Gunakan bulk-save untuk multiple items
3. **Error Retry**: Implement retry logic untuk network errors
4. **Logging**: Log semua API calls untuk debugging
5. **Monitoring**: Monitor API usage untuk avoid rate limits

## Next Steps

- Baca dokumentasi lengkap: `backend/docs/ACCURATE_API_TOKEN.md`
- Lihat contoh implementasi di `backend/services/accurateService.js`
- Test semua endpoints dengan Postman atau curl
- Implement error handling di production

## Support

- Email: aol-integration@cpssoft.com
- Docs: https://account.accurate.id/developer/api-docs.do
- GitHub: https://github.com/aol-integration
