#!/bin/bash

# Configuration
PROJECT_ID=$(gcloud config get-value project)
APP_NAME="aqia-app"
REGION="us-central1"

echo "Using Project ID: $PROJECT_ID"

# 1. Build the Docker image using Cloud Build (preserves local bandwidth and uses cloud cache)
# Or build locally and push. Let's use local build + push for simplicity if Docker is available.
# But Cloud Build is often safer if local Docker is not set up perfectly.
# Let's try direct submission to GCR/Artifact Registry.

echo "Building and Submitting image to Google Container Registry..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$APP_NAME .

# 2. Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $APP_NAME \
  --image gcr.io/$PROJECT_ID/$APP_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1

echo "Deployment Complete!"
