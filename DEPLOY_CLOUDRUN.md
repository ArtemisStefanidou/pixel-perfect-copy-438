# Deploy SkillsBox frontend to Google Cloud Run

The repo ships with a production-ready Docker image (nginx serving the
TanStack Router SPA build) suitable for [Google Cloud Run](https://cloud.google.com/run).

## 1. Prerequisites

- A Google Cloud project with billing enabled
- `gcloud` CLI installed and authenticated (`gcloud auth login`)
- Artifact Registry / Cloud Build APIs enabled:
  ```bash
  gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
  ```

## 2. One-command deploy (build + deploy from source)

```bash
gcloud run deploy skillsbox-web \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080
```

Cloud Build will detect the `Dockerfile`, build the image, push it to Artifact
Registry, and deploy the revision. Cloud Run injects `$PORT=8080`, which the
included `nginx.conf` template binds to automatically.

## 3. Manual build & push

```bash
PROJECT_ID=$(gcloud config get-value project)
REGION=europe-west1

gcloud builds submit --tag $REGION-docker.pkg.dev/$PROJECT_ID/web/skillsbox:latest .

gcloud run deploy skillsbox-web \
  --image $REGION-docker.pkg.dev/$PROJECT_ID/web/skillsbox:latest \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080
```

## 4. Point at your FastAPI backend

The frontend reads `VITE_API_BASE_URL` at build time. Pass it as a build
substitution when triggering Cloud Build, or set it locally before running
`vite build --config vite.cloudrun.config.ts`.

```bash
VITE_API_BASE_URL=https://api.example.com bunx vite build --config vite.cloudrun.config.ts
```

## 5. Local smoke test

```bash
docker build -t skillsbox-web .
docker run --rm -p 8080:8080 -e PORT=8080 skillsbox-web
# open http://localhost:8080
```

Health endpoint: `GET /healthz` → `200 ok`.
