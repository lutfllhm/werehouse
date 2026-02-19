# 🔧 VPS Troubleshooting Commands - Quick Reference

Cheatsheet command untuk troubleshoot masalah deployment di VPS.

---

## 🚨 Website Error 500/502

```bash
# Diagnostic otomatis
cd /var/www/iware/backend && npm run diagnose

# Check semua service
systemctl status nginx mysql
pm2 status

# Test backend
curl http://localhost:5000/api/health

# Check logs
pm2 logs iware-backend --lines 50
tail -50 /var/log/nginx/error.log
```

---

## 🔍 Check Status

```bash
# Backend status
pm2 status
pm2 logs iware-backend

# Nginx status
systemctl status nginx
nginx -t

# MySQL status
systemctl status mysql

# Check ports
netstat -tulpn | grep -E '(80|443|3306|5000)'

# Disk space
df -h

# Memory
free -h
```

---

## 🔄 Restart Services

```bash
# Restart backend
pm2 restart iware-backend

# Restart Nginx
systemctl restart nginx

# Restart MySQL
systemctl restart mysql

# Restart all
pm2 restart all
systemctl restart nginx mysql
```

---

## 📝 View Logs

```bash
# Backend logs (real-time)
pm2 logs iware-backend

# Backend logs (last 100 lines)
pm2 logs iware-backend --lines 100

# Nginx access log
tail -f /var/log/nginx/iware-access.log

# Nginx error log
tail -f /var/log/nginx/iware-error.log
tail -f /var/log/nginx/error.log

# MySQL error log
tail -f /var/log/mysql/error.log

# System log
journalctl -xe
```

---

## 🗄️ Database Commands

```bash
# Check database
cd /var/www/iware/backend
npm run check-db

# Test MySQL connection
mysql -u iware_user -p -h 127.0.0.1 iware_warehouse

# Show tables
mysql -u iware_user -p -h 127.0.0.1 iware_warehouse -e "SHOW TABLES;"

# Count users
mysql -u iware_user -p -h 127.0.0.1 iware_warehouse -e "SELECT COUNT(*) FROM users;"

# Backup database
mysqldump -u iware_user -p iware_warehouse > backup_$(date +%Y%m%d).sql
```

---

## 🔧 Fix Common Issues

### Backend tidak running

```bash
cd /var/www/iware/backend
pm2 delete iware-backend
pm2 start ecosystem.config.js
pm2 save
```

### Frontend tidak muncul

```bash
cd /var/www/iware/frontend
npm run build
systemctl reload nginx
```

### Database error

```bash
cd /var/www/iware/backend
npm run setup-interactive
```

### Accurate token error

```bash
cd /var/www/iware/backend
npm run test-accurate
npm run add-accurate-table
```

### SSL certificate error

```bash
certbot renew
systemctl reload nginx
```

---

## 📦 Update Aplikasi

```bash
cd /var/www/iware

# Pull latest code
git pull origin main

# Update backend
cd backend
npm install --production
pm2 restart iware-backend

# Update frontend
cd ../frontend
npm install
npm run build

# Reload Nginx
systemctl reload nginx
```

---

## 🧹 Cleanup

```bash
# Clear PM2 logs
pm2 flush

# Clear old logs
find /var/log -type f -name "*.log" -mtime +30 -delete

# Clear apt cache
apt clean
apt autoremove

# Clear npm cache
npm cache clean --force
```

---

## 🔐 Security Check

```bash
# Check firewall
ufw status

# Check open ports
netstat -tulpn | grep LISTEN

# Check failed login attempts
grep "Failed password" /var/log/auth.log | tail -20

# Check disk usage
du -sh /var/www/iware/*
```

---

## 📊 Performance Monitoring

```bash
# CPU & Memory usage
top
htop

# PM2 monitoring
pm2 monit

# Nginx connections
netstat -an | grep :80 | wc -l

# MySQL connections
mysql -u root -p -e "SHOW PROCESSLIST;"
```

---

## 🆘 Emergency Commands

```bash
# Kill all node processes
pkill -9 node

# Restart all services
pm2 restart all
systemctl restart nginx mysql

# Check if port 5000 is in use
lsof -i :5000

# Kill process on port 5000
kill -9 $(lsof -t -i:5000)

# Reboot VPS (last resort!)
reboot
```

---

## 📞 Get Help

```bash
# System info
uname -a
node --version
npm --version
mysql --version
nginx -v

# Collect diagnostic info
cd /var/www/iware/backend
npm run diagnose > diagnostic.txt

# Check configuration
cat /var/www/iware/backend/.env | grep -v PASSWORD
cat /etc/nginx/sites-available/iware
```

---

## 💡 Tips

1. **Selalu check logs dulu** - `pm2 logs` dan `tail -f /var/log/nginx/error.log`
2. **Test backend langsung** - `curl http://localhost:5000/api/health`
3. **Gunakan diagnostic script** - `npm run diagnose`
4. **Backup sebelum update** - `mysqldump` dan `git stash`
5. **Monitor resources** - `pm2 monit` dan `htop`

---

**Print halaman ini dan simpan untuk referensi cepat!**
