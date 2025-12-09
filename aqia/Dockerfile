# Stage 1: Build the React Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Accept API Key as build argument
ARG VITE_GROQ_API_KEY
# Set it as environment variable so Vite can inline it during build
ENV VITE_GROQ_API_KEY=$VITE_GROQ_API_KEY

# Build the app to the 'dist' folder
RUN npm run build

# Stage 2: Python Backend with eSpeak
FROM python:3.11-slim

# Install system dependencies
# espeak-ng is required for Coqui TTS
# libsndfile1 is often needed for audio processing
RUN apt-get update && apt-get install -y \
    espeak-ng \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/* \
    && ln -s /usr/bin/espeak-ng /usr/bin/espeak

WORKDIR /app

# Copy python requirements and install
COPY server/requirements.txt .
# Install python dependencies
# Using --no-cache-dir to keep image small
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY server/ ./server/

# Set environment variables for build and runtime
ENV COQUI_TOS_AGREED=1
ENV PROD=true
ENV PORT=8000
# EXPOSE is just metadata, but good practice
EXPOSE 8000

# Pre-download the TTS model so it's cached in the image
# This prevents downloading it on every container start (cold start)
RUN python server/download_model.py

# Copy the built frontend assets from Stage 1
# We'll place them in server/static so FastAPI can serve them
COPY --from=frontend-builder /app/dist ./server/static

# Command to run the application
# We use shell form to allow expansion of $PORT
CMD uvicorn server.main:app --host 0.0.0.0 --port ${PORT:-8000}
