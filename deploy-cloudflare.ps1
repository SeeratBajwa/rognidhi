# Cloudflare Pages Deployment Script
# Run this after setting up Wrangler and authenticating

echo "🚀 Deploying RogNidhi to Cloudflare Pages..."

# Install Wrangler CLI if not installed
npm install -g wrangler

# Login to Cloudflare (if not already logged in)
wrangler auth login

# Deploy to Cloudflare Pages
wrangler pages deploy frontend/dist --project-name rognidhi-frontend --branch main

echo "✅ Deployment complete!"
echo "🌐 Your site will be available at: https://rognidhi-frontend.pages.dev"