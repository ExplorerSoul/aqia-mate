# Configuration
$PROJECT_ID = gcloud config get-value project
$APP_NAME = "aqia-app"
$REGION = "us-central1"

Write-Host "Using Project ID: $PROJECT_ID"

# 1. Build and Submit to Google Container Registry
Write-Host "Building and Submitting image to Google Container Registry..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$APP_NAME .

# 2. Deploy to Cloud Run
Write-Host "Deploying to Cloud Run..."
gcloud run deploy $APP_NAME `
  --image gcr.io/$PROJECT_ID/$APP_NAME `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --memory 2Gi `
  --cpu 1

Write-Host "Deployment Complete!"
