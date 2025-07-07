# CardViewer Deployment Guide

## Deployment Options

### Option 1: Docker/Portainer (Recommended)
For Docker-based deployment with Portainer management - see "Docker Deployment" section below.

### Option 2: VPS/Dedicated Server (Full Control)
For servers with SSH access and full control - see "VPS Deployment" section below.

### Option 3: cPanel/Shared Hosting
For cPanel or shared hosting without SSH access - see "Shared Hosting Deployment" section below.

---

## Docker Deployment (Portainer Compatible)

### Prerequisites
- Docker and Docker Compose installed
- Portainer (optional, for web-based management)
- 2GB+ RAM recommended

### Step 1: Quick Start

```bash
# Clone the repository
git clone https://github.com/your-repo/CardViewer.git
cd CardViewer

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env

# Build and start services
docker-compose up -d
```

### Step 2: Using Portainer

1. **Access Portainer Web Interface**
   - Navigate to your Portainer instance (usually `http://localhost:9000`)

2. **Deploy Stack**
   - Go to "Stacks" → "Add Stack"
   - Name: `cardviewer`
   - Build method: "Repository"
   - Repository URL: `https://github.com/your-repo/CardViewer.git`
   - Compose path: `docker-compose.yml`
   - Environment variables:
     ```
     SESSION_SECRET=your-random-secret-key-here
     ```

3. **Deploy the Stack**
   - Click "Deploy the stack"
   - Monitor deployment in the logs

### Step 3: Alternative - Upload Compose File

1. **Copy docker-compose.yml**
   ```yaml
   version: '3.8'

   services:
     backend:
       build: 
         context: ./backend
         dockerfile: Dockerfile
       container_name: cardviewer-backend
       restart: unless-stopped
       environment:
         - NODE_ENV=production
         - PORT=5000
         - SESSION_SECRET=${SESSION_SECRET:-change-this-secret-key}
         - DATABASE_PATH=/app/data/cards.db
         - UPLOAD_DIR=/app/uploads
       ports:
         - "5000:5000"
       volumes:
         - backend_data:/app/data
         - backend_uploads:/app/uploads
       networks:
         - cardviewer-network

     frontend:
       build: 
         context: ./frontend
         dockerfile: Dockerfile
       container_name: cardviewer-frontend
       restart: unless-stopped
       ports:
         - "3000:80"
       depends_on:
         - backend
       networks:
         - cardviewer-network

   networks:
     cardviewer-network:
       driver: bridge

   volumes:
     backend_data:
       driver: local
     backend_uploads:
       driver: local
   ```

2. **Deploy via Portainer**
   - Go to "Stacks" → "Add Stack"
   - Name: `cardviewer`
   - Build method: "Web editor"
   - Paste the docker-compose.yml content
   - Add environment variables if needed
   - Click "Deploy the stack"

### Step 4: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Default Admin**: username: `admin`, password: `admin123`

### Step 5: Configuration

**Environment Variables:**
- `SESSION_SECRET`: Random secret key for sessions
- `NODE_ENV`: Set to `production`
- `PORT`: Backend port (default: 5000)

**Persistent Data:**
- Database: Stored in `backend_data` volume
- Uploads: Stored in `backend_uploads` volume

**Port Mapping:**
- Frontend: `3000:80`
- Backend: `5000:5000`

### Management Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Update and rebuild
docker-compose pull
docker-compose up -d --build

# Backup data
docker run --rm -v cardviewer_backend_data:/data -v $(pwd):/backup alpine tar czf /backup/cardviewer-backup.tar.gz /data
```

### Troubleshooting

- **Port conflicts**: Change ports in docker-compose.yml
- **Build failures**: Check Dockerfile syntax and dependencies
- **Database issues**: Verify volume permissions and paths
- **Network errors**: Ensure containers are on the same network

---

## Shared Hosting Deployment (cPanel/File Manager)

### Prerequisites
- cPanel hosting account or similar control panel
- Node.js support (check with your hosting provider)
- MySQL database access (or SQLite support)

### Step 1: Build the Application Locally

```bash
# Clone or have the CardViewer project locally
cd CardViewer

# Install frontend dependencies and build
cd frontend
npm install
npm run build

# Build backend (if Node.js is supported)
cd ../backend
npm install
npm run build
```

### Step 2: Deploy Frontend (Static Files)

1. **Using File Manager:**
   - Access your cPanel File Manager
   - Navigate to `public_html` (or your domain's public folder)
   - Create a folder named `cardviewer` (optional)
   - Upload all files from `frontend/build/` to this folder
   - Extract if uploaded as zip

2. **Using FTP:**
   ```bash
   # Upload via FTP client
   ftp your-domain.com
   cd public_html
   put -r frontend/build/* .
   ```

### Step 3: Deploy Backend (If Node.js Supported)

1. **Check Node.js Support:**
   - Look for "Node.js" in your cPanel
   - Contact hosting provider if unsure

2. **Upload Backend Files:**
   - Create a `backend` folder outside `public_html`
   - Upload backend files (excluding `node_modules`)
   - Install dependencies via cPanel Node.js interface or terminal

3. **Configure Environment:**
   - Create `.env` file in backend folder:
   ```env
   NODE_ENV=production
   PORT=3000
   SESSION_SECRET=your-random-secret-here
   DATABASE_PATH=./data/cards.db
   UPLOAD_DIR=./uploads
   ```

### Step 4: Database Setup

**Option A: SQLite (Simpler)**
- Upload the `backend/data/cards.db` file
- Ensure proper file permissions (644)

**Option B: MySQL (via cPanel)**
1. Create MySQL database in cPanel
2. Import `backend/database.sql`
3. Update `.env` with MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   ```

### Step 5: Configure Application

1. **Update API URLs:**
   - Edit `frontend/src/api.ts` before building
   - Change API base URL to your domain:
   ```typescript
   const API_BASE_URL = 'https://yourdomain.com/api';
   ```

2. **Start Node.js Application:**
   - Use cPanel Node.js interface
   - Set startup file to `src/index.js`
   - Start the application

### Step 6: Static-Only Deployment (No Backend)

If Node.js isn't supported, deploy as static site:

1. **Modify Frontend for Static Mode:**
   - Create `frontend/src/data/cards.json` with sample data
   - Update components to use static data
   - Remove admin functionality

2. **Build and Deploy:**
   ```bash
   npm run build
   ```
   - Upload `build/` contents to `public_html`

---

## VPS Deployment (Full Control)

### Prerequisites
- Linux server with root/sudo access
- Node.js 18+ and npm
- nginx (for reverse proxy)
- PM2 (for process management)

### 1. Server Setup

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

### 2. Upload Application

```bash
# Transfer files to server (from your local machine)
rsync -avz --exclude node_modules --exclude .git /path/to/CardViewer/ user@server:/var/www/cardviewer/

# Or use git clone on server
cd /var/www/cardviewer
git clone https://github.com/your-repo/CardViewer.git .
```

### 3. Install Dependencies & Build

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

### 4. Configure Environment

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

### 5. Setup Database

```bash
cd /var/www/cardviewer/backend
# Database will be created automatically on first run
# Ensure proper permissions
chmod 644 database.db uploads/
```

### 6. Configure PM2

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

### 7. Configure Nginx

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

### 8. Setup SSL (Optional but Recommended)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### 9. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 10. Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check nginx status
sudo systemctl status nginx

# Check logs
pm2 logs cardviewer-backend
sudo tail -f /var/log/nginx/access.log
```

---

## Hosting Provider Recommendations

### For Full-Featured Deployment:
- **DigitalOcean** - VPS with Node.js support
- **Linode** - Reliable VPS hosting
- **AWS EC2** - Scalable cloud hosting

### For Shared Hosting:
- **Hostinger** - cPanel with Node.js support
- **A2 Hosting** - Developer-friendly shared hosting
- **SiteGround** - Managed WordPress/cPanel hosting

### For Static-Only Deployment:
- **Netlify** - Free static hosting with forms
- **Vercel** - Optimized for React apps
- **GitHub Pages** - Free static hosting

---

## Troubleshooting

### Shared Hosting Issues:
- **Node.js not supported**: Deploy as static site or upgrade hosting
- **Database connection errors**: Check MySQL credentials in cPanel
- **File upload issues**: Verify folder permissions (755 for folders, 644 for files)
- **API calls failing**: Check if backend is running in cPanel Node.js interface

### VPS Issues:
- **502 Bad Gateway**: Check if backend is running with `pm2 status`
- **File upload issues**: Verify uploads directory permissions
- **Database issues**: Check database file permissions and path
- **Font loading**: Ensure nginx serves static files properly

Your CardViewer app should now be accessible at your domain!