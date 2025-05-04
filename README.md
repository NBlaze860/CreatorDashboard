# Creator Dashboard App

A full-stack application that features user authentication, a credit points system, content feed aggregation, and separate dashboards for users and admins. Built using Node.js, Express.js, React.js, Tailwind CSS, and MongoDB.

---

## 🚀 Features

### 1. User Authentication
- Register and login using JWT authentication.
- Role-based access: user and admin.
- Admin role is manually assigned via the database.
> **Note**: To login as admin, use email: ab@ab dot com and password: 123456

### 2. Credit Points System
- Users earn credits for various actions:
  - +10 on registration
  - +20 for completing profile
  - +5 for daily login
  - +2 for saving content
- Users can view their credit balance in their profile.
- Admins can manually credit users with a specified reason.

### 3. Feed Aggregator
- Aggregates posts from the Creator Economy space on:
  - Twitter (X)
  - Reddit
- Features:
  - Scrollable feed (Twitter first, then Reddit)
  - Save posts
  - Share post links
  - Report content (with reason)
  - Open original post in a new tab

### 4. Dashboard
#### User Dashboard:
- Displays:
  - Current credit balance
  - Number of saved posts
  - Recent interactions
  - Recently saved posts

#### Admin Dashboard:
- Displays:
  - Total users
  - Number of incomplete profiles
  - Reported content (highlighted in red)
  - User list with info and credit management
  - Report details including reasons and reporting users

### 5. Tech Stack & Deployment
- **Backend**: Node.js + Express.js (deployed on Google Cloud Run)
- **Frontend**: React.js + Tailwind CSS (deployed on Firebase Hosting)
- **Database**: MongoDB (hosted on MongoDB Atlas)

---

## 💻 Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create a `.env` file in the root directory with the following variables:

```
PORT=your_port
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
TWITTER_BEARER_TOKEN=your_twitter_token
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
VITE_API_URL=http://localhost:your_port/api
```

> **Note**: `.env` is shared only for assignment review purposes and will be removed later.

### 3. Start the App

To run frontend and backend together:
```bash
npm run dev:all
```

To run separately:
```bash
# Frontend
npm run dev

# Backend
npm run server
```

### 4. Build Frontend for Production
```bash
npm run build
npm run preview
```

---

## 🚢 Deployment Steps

### 1. Backend Deployment (Google Cloud Run)

#### Build Docker Image:
```bash
docker build -t backend-service .
```

#### Tag Docker Image:
```bash
docker tag backend-service YOUR_GCP_REGION-docker.pkg.dev/YOUR_PROJECT_ID/your-repo-name/backend-service:latest
```

#### Authenticate Docker with GCP:
```bash
gcloud auth configure-docker YOUR_GCP_REGION-docker.pkg.dev
```

#### Push Image to Artifact Registry:
```bash
docker push YOUR_GCP_REGION-docker.pkg.dev/YOUR_PROJECT_ID/your-repo-name/backend-service:latest
```

#### Deploy to Cloud Run:
```bash
gcloud run deploy backend-service \
  --image YOUR_GCP_REGION-docker.pkg.dev/YOUR_PROJECT_ID/your-repo-name/backend-service:latest \
  --platform managed \
  --region YOUR_GCP_REGION \
  --allow-unauthenticated \
  --set-secrets=MONGO_URI=YOUR_MONGO_URI_SECRET_NAME:latest,JWT_SECRET=YOUR_JWT_SECRET_NAME:latest
# Add more --set-secrets as needed
```

> After deployment, note the **Service URL** — this is the backend API endpoint.

---

### 2. Frontend Deployment (Firebase Hosting)

#### Configure API URL:
Update `.env.production` with:
```env
VITE_API_URL=https://your-backend-service-url.a.run.app/api
```

#### Build Frontend:
```bash
npm run build
```

#### Initialize Firebase Hosting (first-time only):
```bash
firebase init hosting
```

#### Deploy to Firebase:
```bash
firebase deploy --only hosting
```

> Note the **Hosting URL** after deployment — this is where your frontend is live.

---

### 3. Final Testing

- Visit the Firebase Hosting URL.
- Test application functionality.
- Check developer console and Cloud Run logs for issues.

---

## 🔁 Redeploying

### Backend
```bash
# After changes
docker build -t backend-service .
docker tag backend-service ...
docker push ...
gcloud run deploy ...
```

### Frontend
```bash
npm run build
firebase deploy --only hosting
```

> Don't forget to clear browser cache after redeploying frontend!

---
