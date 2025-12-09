# Configuration
$PROJECT_ID = gcloud config get-value project
$APP_NAME = "aqia-app"
$REGION = "us-central1"

Write-Host "Using Project ID: $PROJECT_ID"

# 1. Read API Key from .env
$EnvContent = Get-Content .env -ErrorAction SilentlyContinue
$GROQ_KEY = ""
foreach ($line in $EnvContent) {
    if ($line -match "^VITE_GROQ_API_KEY=(.*)") {
        $GROQ_KEY = $matches[1].Trim()
        break
    }
}

if (-not $GROQ_KEY) {
    Write-Error "❌ VITE_GROQ_API_KEY not found in .env file! Deployment cancelled."
    exit 1
}

Write-Host "✅ Found API Key. Proceeding with build..."

# 2. Build and Deploy using Cloud Build Config
Write-Host "Submitting build to Cloud Build..."
gcloud builds submit --config cloudbuild.yaml --substitutions=_GROQ_API_KEY="$GROQ_KEY" .

Write-Host "Deployment Triggered! Check Cloud Build logs for progress."
