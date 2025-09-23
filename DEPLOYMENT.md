# Vercel Deployment Guide for GG Copy Matrix

## Prerequisites
- Vercel account (free tier available)
- GitHub repository (already set up)
- Environment variables configured

## Step 1: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name: copy-matrix (or your preferred name)
# - Directory: ./
# - Override settings? No
```

### Option B: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository: `sgwstudio/copy-matrix`
4. Configure settings (see below)

## Step 2: Configure Environment Variables

In your Vercel dashboard, go to Project Settings > Environment Variables and add:

### Required Variables:
```
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-app.vercel.app
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Database Setup Options:

#### Option 1: Vercel Postgres (Recommended)
1. In Vercel dashboard, go to Storage tab
2. Create a new Postgres database
3. Copy the connection string to `DATABASE_URL`

#### Option 2: External Database
- **PlanetScale** (MySQL): Free tier available
- **Supabase** (Postgres): Free tier available
- **Railway** (Postgres): Free tier available

## Step 3: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services > Credentials
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URIs:
   - `https://your-app.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for local dev)

## Step 4: Database Migration

After setting up your database, run migrations:

```bash
# Install Prisma CLI globally if not already installed
npm install -g prisma

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

## Step 5: Deploy and Test

1. Push your latest changes to GitHub
2. Vercel will automatically redeploy
3. Test all functionality:
   - User authentication
   - API key management
   - Copy generation
   - All three modes (Sneaker Release, Voice Test Lab, Horoscope)

## Environment-Specific Notes

### Production Environment Variables:
- `NEXTAUTH_URL`: Your production domain
- `DATABASE_URL`: Production database connection
- `NEXTAUTH_SECRET`: Strong random string (32+ characters)

### Development vs Production:
- Local: `http://localhost:3000`
- Production: `https://your-app.vercel.app`

## Troubleshooting

### Common Issues:
1. **Database Connection**: Ensure `DATABASE_URL` is correct
2. **OAuth Redirect**: Check redirect URIs in Google Console
3. **Environment Variables**: Verify all required vars are set
4. **Build Errors**: Check Vercel build logs for specific issues

### Build Optimization:
- The app is already optimized for Vercel
- Uses Next.js 15 with App Router
- Includes proper TypeScript configuration
- Optimized for production builds

## Monitoring

After deployment, monitor:
- Vercel Analytics (built-in)
- Function execution times
- Database performance
- Error rates

## Cost Considerations

### Vercel Free Tier Includes:
- 100GB bandwidth/month
- 100GB-hours function execution
- Unlimited static deployments
- Custom domains

### Database Costs:
- Vercel Postgres: $20/month for Pro
- External options: Often have free tiers

## Security Notes

- All environment variables are encrypted
- Database credentials are secure
- OAuth secrets are protected
- API keys are user-specific (not shared)

## Next Steps After Deployment

1. Set up custom domain (optional)
2. Configure monitoring and alerts
3. Set up automated backups
4. Consider upgrading to Pro for production use
