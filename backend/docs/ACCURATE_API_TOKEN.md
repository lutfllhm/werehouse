# Accurate Online API Token Implementation

Implementasi API Token Accurate Online sesuai dengan dokumentasi resmi `accurate-online-api-token-1.0.3.pdf`.

## Overview

API Token adalah metode autentikasi untuk mengakses API Accurate Online. Berbeda dengan OAuth yang memerlukan user interaction, API Token dapat digunakan langsung untuk integrasi server-to-server.

## Komponen Utama

### 1. Authorization Header

```
Authorization: Bearer {API_TOKEN}
```

API Token dikirimkan sebagai Bearer Token di header Authorization.

### 2. X-Api-Timestamp

Header yang berisi timestamp saat request dikirim. Accurate Online memberikan toleransi ±600 detik (10 menit).

**Format yang didukung:**
- `dd/mm/yyyy hh:mm:ss` - Format Indonesia
- `yyyy-mm-ddThh:mm:ss` - ISO 8601 WIB
- `yyyy-mm-ddThh:mm:ssZ` - ISO 8601 UTC
- `yyyy-mm-ddThh:mm:ss+0800` - ISO 8601 with timezone
- Unix timestamp (seconds)
- Unix timestamp (milliseconds)

**Implementasi:**
```javascript
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
```

### 3. X-Api-Signature

Header yang berisi hasil HMAC SHA-256 dari timestamp menggunakan Signature Secret sebagai key.

**Implementasi:**
```javascript
generateSignature(timestamp) {
  const hmac = crypto.createHmac('sha256', this.signatureSecret);
  hmac.update(timestamp);
  return hmac.digest('base64');
}
```

## Flow Penggunaan

### 1. Request API Token Info

Endpoint: `POST https://account.accurate.id/api/api-token.do`

**Headers:**
```
Authorization: Bearer {API_TOKEN}
X-Api-Timestamp: {TIMESTAMP}
X-Api-Signature: {SIGNATURE}
```

**Response:**
```json
{
  "s": true,
  "d": {
    "data usaha": {
      "id": 96400,
      "alias": "PT AOL User",
      "host": "https://zeus.accurate.id",
      "admin": true,
      "license": {
        "licenseEnd": "01/12/2023",
        "trial": true
      }
    },
    "application": {
      "name": "Application - Developer",
      "appKey": "6c89274a-0ddf-43e1-88b0-e9781ca58b74"
    },
    "user": {
      "id": 36000,
      "email": "user@example.com",
      "fullName": "User Name"
    },
    "tokenType": "api"
  }
}
```

**Penting:** Response ini memberikan `host` yang harus digunakan untuk semua API calls berikutnya.

### 2. Request API Accurate Online

Endpoint: `{HOST}/accurate/api/{endpoint}.do`

Contoh: `https://zeus.accurate.id/accurate/api/item/list.do`

**Headers:**
```
Authorization: Bearer {API_TOKEN}
X-Api-Timestamp: {TIMESTAMP}
X-Api-Signature: {SIGNATURE}
X-Language-Profile: ID|US|CN (optional)
```

## Fitur Implementasi

### 1. Dynamic Host dengan Caching

Host dari Accurate Online dapat berubah sewaktu-waktu. Implementasi kami:

- Mengambil host dari `/api/api-token.do`
- Cache host selama 30 hari per token
- Otomatis refresh setelah 30 hari

```javascript
async getHost(accessToken) {
  const cachedHost = this.hostCache.get(accessToken);
  const cachedTime = this.hostCacheTime.get(accessToken);
  
  if (cachedHost && cachedTime) {
    const daysSinceCache = (Date.now() - cachedTime) / (1000 * 60 * 60 * 24);
    if (daysSinceCache < 30) {
      return cachedHost;
    }
  }
  
  // Fetch new host...
}
```

### 2. Automatic Redirect Handling

Jika host berubah, Accurate Online akan mengembalikan HTTP 308 (Permanent Redirect). Implementasi kami menggunakan axios dengan konfigurasi:

```javascript
{
  maxRedirects: 5,
  validateStatus: (status) => status < 400
}
```

Ini memastikan:
- Otomatis follow redirect
- Method HTTP tetap sama (POST tetap POST)
- Authorization header tetap dikirim

### 3. Multi-Language Support

Mendukung pesan error dalam berbagai bahasa:

```javascript
async getHeaders(userId, languageProfile = 'ID') {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'X-Api-Timestamp': timestamp,
    'X-Api-Signature': signature,
    'Content-Type': 'application/json'
  };
  
  if (languageProfile && languageProfile !== 'ID') {
    headers['X-Language-Profile'] = languageProfile;
  }
  
  return headers;
}
```

**Bahasa yang didukung:**
- `ID` - Indonesia (default)
- `US` - English
- `CN` - Chinese

### 4. Rate Limiting Awareness

Accurate Online memiliki batasan:
- Maksimal 8 API calls per detik
- Maksimal 8 proses paralel

Implementasi kami menggunakan async/await untuk menghindari race condition.

## Error Handling

### Common Errors

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `Unauthorized` | API Token tidak dikirim | Pastikan header Authorization ada |
| `Invalid_token` | API Token salah | Periksa nilai API Token |
| `Invalid or Revoked API Token` | Token sudah dicabut | Minta user generate token baru |
| `Header X-Api-Signature is required` | Signature tidak dikirim | Pastikan generate signature |
| `Header X-Api-Signature invalid` | Signature salah | Periksa Signature Secret |
| `Header X-Api-Timestamp is required` | Timestamp tidak dikirim | Pastikan generate timestamp |
| `Header X-Api-Timestamp invalid` | Format timestamp salah | Gunakan format yang benar |
| `Header X-Api Timestamp difference more than 600 seconds` | Timestamp terlalu lama | Gunakan timestamp terbaru |

### Error Response Example

```json
{
  "s": false,
  "message": "Header X-Api-Signature invalid"
}
```

## Environment Variables

```env
# API Token (dari Accurate Online)
ACCURATE_ACCESS_TOKEN=aat.xxx.yyy.zzz

# Signature Secret (dari Accurate Online)
ACCURATE_SIGNATURE_SECRET=31d49b3dc632614495ff8071e5be44a1

# Optional: Database ID
ACCURATE_DATABASE_ID=12345
```

## Testing

Jalankan test script untuk memverifikasi implementasi:

```bash
node backend/scripts/testApiToken.js
```

Test akan memverifikasi:
1. ✓ Timestamp generation
2. ✓ HMAC SHA-256 signature
3. ✓ API Token authentication
4. ✓ Dynamic host retrieval
5. ✓ Host caching (30 days)
6. ✓ Request headers
7. ✓ API calls with redirect support

## API Methods

### Token Management

```javascript
// Get API Token Info
const info = await accurateService.getApiTokenInfo(userId);

// Get Dynamic Host
const host = await accurateService.getHost(accessToken);

// Get Headers
const headers = await accurateService.getHeaders(userId, 'US');
```

### Item APIs

```javascript
// List Items
const items = await accurateService.getItems(userId, { page: 1, pageSize: 100 });

// Get Item Detail
const item = await accurateService.getItemDetail(userId, itemId);

// Get Item Stock
const stock = await accurateService.getItemStock(userId, itemId);

// Save Item
const result = await accurateService.saveItem(userId, itemData);

// Delete Item
const result = await accurateService.deleteItem(userId, itemId);
```

### Sales Order APIs

```javascript
// List Sales Orders
const orders = await accurateService.getSalesOrders(userId, { page: 1, pageSize: 100 });

// Get Sales Order Detail
const order = await accurateService.getSalesOrderDetail(userId, orderId);

// Save Sales Order
const result = await accurateService.saveSalesOrder(userId, orderData);

// Delete Sales Order
const result = await accurateService.deleteSalesOrder(userId, orderId);
```

## Best Practices

1. **Cache Host**: Selalu cache host untuk mengurangi API calls
2. **Handle Redirects**: Pastikan HTTP client support automatic redirect
3. **Timestamp Fresh**: Generate timestamp baru untuk setiap request
4. **Error Handling**: Handle semua error cases dengan proper message
5. **Rate Limiting**: Jangan exceed 8 calls/second
6. **Token Security**: Simpan API Token dan Signature Secret dengan aman

## References

- Dokumentasi: `accurate-online-api-token-1.0.3.pdf`
- API Docs: https://account.accurate.id/developer/api-docs.do
- Open API Schema: https://account.accurate.id/open-api/json.do
- GitHub Examples: https://github.com/aol-integration

## Support

Jika ada pertanyaan atau kendala, hubungi:
- Email: aol-integration@cpssoft.com
