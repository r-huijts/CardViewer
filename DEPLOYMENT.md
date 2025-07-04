# CardViewer Deployment Guide

## Prerequisites
- Linux server with root/sudo access
- Node.js 18+ and npm
- nginx (for reverse proxy)
- PM2 (for process management)

## 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install nginx and PM2
sudo apt install nginx -y
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www/cardviewer
sudo chown $USER:$USER /var/www/cardviewer
```

## 2. Upload Application

```bash
# Transfer files to server (from your local machine)
rsync -avz --exclude node_modules --exclude .git /path/to/CardViewer/ user@server:/var/www/cardviewer/

# Or use git clone on server
cd /var/www/cardviewer
git clone https://github.com/your-repo/CardViewer.git .
```

## 3. Install Dependencies & Build

```bash
cd /var/www/cardviewer

# Install backend dependencies
cd backend
npm install --production

# Install frontend dependencies and build
cd ../frontend
npm install
npm run build

# Move build to nginx directory
sudo mkdir -p /var/www/html/cardviewer
sudo cp -r build/* /var/www/html/cardviewer/
```

## 4. Configure Environment

```bash
# Create production environment file
cd /var/www/cardviewer/backend
cat > .env << EOF
NODE_ENV=production
PORT=3002
SESSION_SECRET=$(openssl rand -base64 32)
UPLOAD_DIR=./uploads
DATABASE_PATH=./database.db
EOF

# Create uploads directory
mkdir -p uploads
chmod 755 uploads
```

## 5. Setup Database

```bash
cd /var/www/cardviewer/backend
# Database will be created automatically on first run
# Ensure proper permissions
chmod 644 database.db uploads/
```

## 6. Configure PM2

```bash
cd /var/www/cardviewer/backend

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'cardviewer-backend',
    script: 'src/index.js',
    cwd: '/var/www/cardviewer/backend',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    error_file: '/var/log/pm2/cardviewer-error.log',
    out_file: '/var/log/pm2/cardviewer-out.log',
    log_file: '/var/log/pm2/cardviewer.log',
    time: true
  }]
};
EOF

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 7. Configure Nginx

```bash
# Create nginx configuration
sudo tee /etc/nginx/sites-available/cardviewer << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain
    
    # Frontend (React build)
    location / {
        root /var/www/html/cardviewer;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3002/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # File uploads
    location /uploads/ {
        alias /var/www/cardviewer/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site and restart nginx
sudo ln -s /etc/nginx/sites-available/cardviewer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 8. Setup SSL (Optional but Recommended)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## 9. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 10. Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check nginx status
sudo systemctl status nginx

# Check logs
pm2 logs cardviewer-backend
sudo tail -f /var/log/nginx/access.log
```

## Maintenance Commands

```bash
# Restart application
pm2 restart cardviewer-backend

# Update application
cd /var/www/cardviewer
git pull
cd backend && npm install --production
cd ../frontend && npm install && npm run build
sudo cp -r build/* /var/www/html/cardviewer/
pm2 restart cardviewer-backend

# View logs
pm2 logs cardviewer-backend
sudo tail -f /var/log/nginx/error.log

# Backup database
cp /var/www/cardviewer/backend/database.db /backups/cardviewer-$(date +%Y%m%d).db
```

## Troubleshooting

- **502 Bad Gateway**: Check if backend is running with `pm2 status`
- **File upload issues**: Verify uploads directory permissions
- **Database issues**: Check database file permissions and path
- **Font loading**: Ensure nginx serves static files properly

Your CardViewer app should now be accessible at your domain!