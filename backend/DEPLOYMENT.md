# Deployment Guide

This guide will help you deploy the Juicy Delights backend API to production.

## Prerequisites

- Node.js 18+ and npm
- MongoDB 4.4+
- Redis 6+
- Domain name (optional)
- SSL certificate (for production)

## Local Development Setup

1. **Clone and install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start required services**
   ```bash
   # Start MongoDB
   mongod

   # Start Redis
   redis-server
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Production Deployment

### Option 1: Using PM2 (Recommended)

1. **Install PM2 globally**
   ```bash
   npm install -g pm2
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Create PM2 ecosystem file**
   ```bash
   # Create ecosystem.config.js
   cat > ecosystem.config.js << EOF
   module.exports = {
     apps: [{
       name: 'juicy-delights-api',
       script: 'dist/server.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 5000
       },
       error_file: './logs/err.log',
       out_file: './logs/out.log',
       log_file: './logs/combined.log',
       time: true
     }]
   };
   EOF
   ```

4. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Option 2: Using Docker

1. **Create Dockerfile**
   ```bash
   cat > Dockerfile << EOF
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci --only=production

   COPY dist ./dist
   COPY .env ./

   EXPOSE 5000

   CMD ["node", "dist/server.js"]
   EOF
   ```

2. **Create docker-compose.yml**
   ```bash
   cat > docker-compose.yml << EOF
   version: '3.8'
   services:
     api:
       build: .
       ports:
         - "5000:5000"
       environment:
         - NODE_ENV=production
       depends_on:
         - mongodb
         - redis
       restart: unless-stopped

     mongodb:
       image: mongo:4.4
       ports:
         - "27017:27017"
       volumes:
         - mongodb_data:/data/db
       restart: unless-stopped

     redis:
       image: redis:6-alpine
       ports:
         - "6379:6379"
       restart: unless-stopped

   volumes:
     mongodb_data:
   EOF
   ```

3. **Deploy with Docker**
   ```bash
   docker-compose up -d
   ```

### Option 3: Using Cloud Platforms

#### Heroku

1. **Install Heroku CLI**
   ```bash
   # Install Heroku CLI
   # https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Heroku app**
   ```bash
   heroku create juicy-delights-api
   ```

3. **Add MongoDB and Redis addons**
   ```bash
   heroku addons:create mongolab:sandbox
   heroku addons:create heroku-redis:hobby-dev
   ```

4. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-jwt-secret
   # Add other environment variables
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

#### AWS EC2

1. **Launch EC2 instance**
   - Choose Ubuntu 20.04 LTS
   - t3.medium or larger
   - Configure security groups

2. **Install dependencies**
   ```bash
   sudo apt update
   sudo apt install nodejs npm mongodb redis-server nginx
   ```

3. **Deploy application**
   ```bash
   # Clone repository
   git clone <your-repo>
   cd backend
   npm install
   npm run build
   ```

4. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/juicy-delights
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable site and restart Nginx**
   ```bash
   sudo ln -s /etc/nginx/sites-available/juicy-delights /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Environment Configuration

### Required Environment Variables

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/juicy-delights
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_REFRESH_EXPIRE=30d

# Payment Gateways
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Cloud Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# CORS
FRONTEND_URL=https://your-frontend-domain.com
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)

1. **Install Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Get SSL certificate**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Auto-renewal**
   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Using Cloudflare

1. **Add domain to Cloudflare**
2. **Enable SSL/TLS encryption**
3. **Configure DNS records**

## Monitoring and Logging

### Using PM2

```bash
# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart application
pm2 restart juicy-delights-api
```

### Using Docker

```bash
# View logs
docker-compose logs -f

# Monitor resources
docker stats
```

## Database Backup

### MongoDB Backup

```bash
# Create backup
mongodump --db juicy-delights --out /backup/$(date +%Y%m%d)

# Restore backup
mongorestore --db juicy-delights /backup/20231201/juicy-delights
```

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup"
DB_NAME="juicy-delights"

# Create backup
mongodump --db $DB_NAME --out $BACKUP_DIR/$DATE

# Compress backup
tar -czf $BACKUP_DIR/$DATE.tar.gz $BACKUP_DIR/$DATE

# Remove uncompressed backup
rm -rf $BACKUP_DIR/$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

## Security Considerations

1. **Firewall Configuration**
   ```bash
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

2. **Database Security**
   - Enable authentication
   - Use strong passwords
   - Restrict network access

3. **API Security**
   - Rate limiting
   - Input validation
   - CORS configuration
   - HTTPS only

4. **Environment Variables**
   - Never commit .env files
   - Use strong secrets
   - Rotate keys regularly

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :5000
   sudo kill -9 <PID>
   ```

2. **MongoDB connection failed**
   ```bash
   sudo systemctl start mongod
   sudo systemctl status mongod
   ```

3. **Redis connection failed**
   ```bash
   sudo systemctl start redis
   sudo systemctl status redis
   ```

4. **Permission denied**
   ```bash
   sudo chown -R $USER:$USER /path/to/app
   ```

### Logs Location

- PM2: `~/.pm2/logs/`
- Docker: `docker-compose logs`
- Nginx: `/var/log/nginx/`
- MongoDB: `/var/log/mongodb/`
- Redis: `/var/log/redis/`

## Performance Optimization

1. **Enable Gzip compression**
2. **Use Redis for caching**
3. **Optimize database queries**
4. **Use CDN for static assets**
5. **Implement rate limiting**
6. **Monitor resource usage**

## Scaling

1. **Horizontal scaling with load balancer**
2. **Database replication**
3. **Redis clustering**
4. **Microservices architecture**
5. **Container orchestration (Kubernetes)**
