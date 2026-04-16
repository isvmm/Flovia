# Social Media App - Backend Architecture Document

## Overview
This document outlines the scalable backend architecture for a premium social media application supporting high-definition video uploads (up to 60 seconds, MP4), high-resolution images (JPEGs), and AI-enhanced content processing.

---

## 1. Storage Architecture

### 1.1 Primary Storage: AWS S3
**Purpose:** Store original and processed video/image assets

**Configuration:**
```
Bucket Structure:
├── videos/
│   ├── original/        (Original user uploads)
│   ├── compressed/      (Transcoded MP4s for playback)
│   └── thumbnails/      (Video preview images)
├── images/
│   ├── original/        (Original high-res uploads)
│   ├── optimized/       (Web-optimized versions)
│   └── thumbnails/      (Mobile-friendly variants)
└── ai-generated/        (AI-enhanced & synthetic content)
```

**Storage Classes:**
- **S3 Standard** - Recent uploads (< 30 days) for fast retrieval
- **S3 Standard-IA** - Archived content (30+ days) for cost optimization
- **S3 Intelligent-Tiering** - Auto-tier based on access patterns

**Versioning & Lifecycle:**
- Enable versioning for recovery
- Auto-delete original uploads after successful transcoding (14 days)
- Archive inactive content to Glacier after 90 days

---

## 2. Content Delivery: CloudFront CDN

**Purpose:** Deliver media globally with minimal latency

**Configuration:**
```
Distribution Settings:
├── Origin 1: S3 (videos/compressed/)
│   └── Origin Path: /videos/compressed
├── Origin 2: S3 (images/optimized/)
│   └── Origin Path: /images/optimized
└── Origin 3: S3 (ai-generated/)
    └── Origin Path: /ai-generated
```

**Caching Strategy:**
| Content Type | TTL | Cache Policy |
|---|---|---|
| MP4 Videos | 365 days | CachingOptimized |
| Optimized Images | 30 days | CachingOptimized |
| Thumbnails | 7 days | CachingOptimized |
| Metadata | 1 hour | Custom |

**Behaviors:**
- Compress videos with H.264 codec (minimize bandwidth)
- Enable HTTP/2 and HTTP/3 for faster delivery
- Geographic restrictions (optional): Block access in restricted regions
- Origin Shield: Enable for high-traffic content

**Cost Optimization:**
- Data transfer out to internet: Negotiate volume discounts
- Use CloudFront functions for header manipulation (no Lambda cost)
- Implement range request support for video seeking

---

## 3. Media Processing Pipeline

### 3.1 Video Transcoding: AWS MediaConvert

**Purpose:** Convert user MP4s to optimized formats for streaming

**Transcoding Templates:**

```json
{
  "Job Template": "SocialMediaVideoTemplate",
  "Input": {
    "Codec": "h264",
    "MaxBitrate": "50 Mbps",
    "Resolution": "up to 4K"
  },
  "Output Profiles": [
    {
      "Profile": "HD",
      "Codec": "h264",
      "Bitrate": "5 Mbps",
      "Resolution": "1920x1080",
      "FrameRate": "30fps"
    },
    {
      "Profile": "Mobile",
      "Codec": "h264",
      "Bitrate": "2.5 Mbps",
      "Resolution": "1280x720",
      "FrameRate": "30fps"
    },
    {
      "Profile": "Low Bandwidth",
      "Codec": "h264",
      "Bitrate": "1 Mbps",
      "Resolution": "854x480",
      "FrameRate": "24fps"
    }
  ],
  "Thumbnail": {
    "Pattern": "00:00:05",
    "Format": "jpg",
    "Width": 1280,
    "Height": 720
  }
}
```

**Job Settings:**
- **Queue**: Create high-priority queue for uploads
- **Pricing**: On-demand transcoding (pay per minute)
- **Output Destination**: `s3://bucket/videos/compressed/{jobId}/`
- **Notifications**: SNS topic for job completion events

**Cost Estimation:**
- 1 min video → ~3 min transcoding (3 profiles) = $0.015
- 1000 videos/day → $15/day or ~$450/month

### 3.2 Image Optimization: AWS Lambda + ImageMagick

**Purpose:** Generate responsive image variants for web and mobile

**Lambda Function: `optimizeImage`**
```
Trigger: S3 event (object created in images/original/)
Runtime: Node.js 18 (with ImageMagick layer)
Memory: 3008 MB
Timeout: 300 seconds
```

**Processing Pipeline:**
```
Original JPEG
├── Resize to 2560×2560 (display)
├── Resize to 1280×1280 (tablet)
├── Resize to 640×640 (mobile)
├── Create 256×256 thumbnail
├── Generate WebP variants (all sizes)
└── Upload all to s3://bucket/images/optimized/{imageId}/
```

**Lambda Code (Pseudocode):**
```javascript
const AWS = require('aws-sdk');
const sharp = require('sharp'); // Better than ImageMagick for Lambda

exports.handler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  
  const image = await s3.getObject({ Bucket: bucket, Key: key }).promise();
  
  // Generate variants
  const variants = [
    { size: 2560, format: 'jpeg' },
    { size: 1280, format: 'jpeg' },
    { size: 640, format: 'jpeg' },
    { size: 256, format: 'jpeg' }, // thumbnail
    { size: 1280, format: 'webp' },
    { size: 640, format: 'webp' }
  ];
  
  for (const variant of variants) {
    const resized = await sharp(image.Body)
      .resize(variant.size, variant.size, { fit: 'cover' })
      .toFormat(variant.format, { quality: 85 })
      .toBuffer();
    
    await s3.putObject({
      Bucket: bucket,
      Key: `images/optimized/${key}/${variant.size}.${variant.format}`,
      Body: resized,
      ContentType: `image/${variant.format}`
    }).promise();
  }
};
```

**Cost Estimation:**
- Execution: 5GB/month data processed → ~$0.16 (very cheap)
- Storage: Minimal overhead with tiered deletion

---

## 4. Database Schema

### 4.1 PostgreSQL (Neon) Core Tables

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  bio TEXT,
  profile_image_url VARCHAR(1024),
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Videos table
CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  
  -- Storage metadata
  original_s3_key VARCHAR(512),
  compressed_s3_key VARCHAR(512),
  thumbnail_s3_key VARCHAR(512),
  duration_seconds INT,
  width INT,
  height INT,
  file_size_bytes BIGINT,
  
  -- Content classification
  content_type VARCHAR(50), -- 'pure-real', 'ai-enhanced', 'pure-ai'
  is_public BOOLEAN DEFAULT true,
  
  -- Engagement metrics
  views_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  
  -- Processing status
  status VARCHAR(50) DEFAULT 'uploading', -- 'uploading', 'processing', 'ready', 'failed'
  transcoding_job_id VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX (user_id),
  INDEX (created_at),
  INDEX (status),
  INDEX (content_type)
);

-- Images table
CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  
  -- Storage metadata
  original_s3_key VARCHAR(512),
  optimized_s3_key VARCHAR(512),
  thumbnail_s3_key VARCHAR(512),
  width INT,
  height INT,
  file_size_bytes BIGINT,
  
  -- Content classification
  content_type VARCHAR(50), -- 'pure-real', 'ai-enhanced', 'pure-ai'
  is_public BOOLEAN DEFAULT true,
  
  -- Engagement metrics
  views_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  
  -- Processing status
  status VARCHAR(50) DEFAULT 'uploading', -- 'uploading', 'optimizing', 'ready', 'failed'
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX (user_id),
  INDEX (created_at),
  INDEX (status),
  INDEX (content_type)
);

-- Likes table
CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id INT REFERENCES videos(id) ON DELETE CASCADE,
  image_id INT REFERENCES images(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (user_id, video_id),
  UNIQUE (user_id, image_id),
  INDEX (user_id),
  INDEX (video_id),
  INDEX (image_id)
);

-- Comments table
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id INT REFERENCES videos(id) ON DELETE CASCADE,
  image_id INT REFERENCES images(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX (user_id),
  INDEX (video_id),
  INDEX (image_id),
  INDEX (created_at)
);

-- Follows table
CREATE TABLE follows (
  id SERIAL PRIMARY KEY,
  follower_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (follower_id, following_id),
  INDEX (follower_id),
  INDEX (following_id)
);

-- AI Content Log (for tracking AI generation)
CREATE TABLE ai_content_log (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type VARCHAR(50), -- 'image', 'music'
  prompt TEXT,
  model_used VARCHAR(100), -- 'gemini-2.0', 'dall-e-3', etc.
  result_s3_key VARCHAR(512),
  generation_time_seconds INT,
  cost_credits DECIMAL(10, 4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX (user_id),
  INDEX (created_at)
);

-- Create indexes for fast queries
CREATE INDEX idx_videos_user_created ON videos(user_id, created_at DESC);
CREATE INDEX idx_images_user_created ON images(user_id, created_at DESC);
CREATE INDEX idx_videos_status_created ON videos(status, created_at DESC);
```

### 4.2 Redis Cache Layer (Optional but Recommended)

**Purpose:** Cache frequently accessed data and session management

```
Cache Keys Structure:
├── user:{userId}:profile          (TTL: 1 hour)
├── user:{userId}:feed            (TTL: 10 minutes)
├── video:{videoId}:metadata      (TTL: 6 hours)
├── image:{imageId}:metadata      (TTL: 6 hours)
├── trending:videos:24h           (TTL: 1 hour)
├── trending:images:24h           (TTL: 1 hour)
└── session:{sessionId}           (TTL: 24 hours)
```

---

## 5. API Endpoints

### 5.1 Video Endpoints

**POST `/api/videos/upload`**
- Initiate video upload
- Request: `{ title, description, content_type }`
- Response: `{ uploadId, presignedUrl, videoId }`
- Presigned URL valid for 15 minutes

**PUT `/api/videos/{videoId}/complete`**
- Finalize video and trigger transcoding
- Request: `{ duration_seconds, width, height, file_size_bytes }`
- Response: `{ videoId, status: 'processing', jobId }`
- Triggers MediaConvert job and SNS notification

**GET `/api/videos/{videoId}`**
- Fetch video metadata and playback URLs
- Response: `{ id, title, thumbnailUrl, duration, variants: { hd, mobile, low } }`
- Serve from CloudFront CDN

**GET `/api/videos/feed`**
- Fetch paginated feed (infinite scroll)
- Query params: `?page=1&limit=20`
- Response: `{ videos: [...], nextPage, totalCount }`
- Query from Redis cache first

**DELETE `/api/videos/{videoId}`**
- Delete video (soft delete: set status='deleted')
- Async cleanup of S3 objects and thumbnails
- Response: `{ success: true }`

**PATCH `/api/videos/{videoId}/like`**
- Like/unlike video
- Request: `{ action: 'like' | 'unlike' }`
- Response: `{ likes_count, isLiked }`
- Update cache invalidation

---

### 5.2 Image Endpoints

**POST `/api/images/upload`**
- Initiate image upload (JPEG)
- Request: `{ title, description, content_type }`
- Response: `{ uploadId, presignedUrl, imageId }`

**PUT `/api/images/{imageId}/complete`**
- Finalize image and trigger optimization Lambda
- Request: `{ width, height, file_size_bytes }`
- Response: `{ imageId, status: 'optimizing' }`

**GET `/api/images/{imageId}`**
- Fetch image metadata and variants
- Response: `{ id, title, variants: { display2560, tablet1280, mobile640, webp }, thumbnail }`

**GET `/api/images/feed`**
- Paginated image feed
- Same structure as video feed

---

### 5.3 User Endpoints

**GET `/api/users/{userId}`**
- Fetch user profile
- Cache: 1 hour (Redis)
- Response: `{ id, username, bio, followers_count, following_count, profileImageUrl }`

**PUT `/api/users/{userId}`**
- Update profile (bio, profile image)
- Cache invalidation on update
- Response: `{ user: {...}, message: 'Profile updated' }`

**GET `/api/users/{userId}/videos`**
- Fetch user's video feed
- Pagination: `?page=1&limit=20`
- Response: `{ videos: [...], nextPage }`

**POST `/api/users/{userId}/follow`**
- Follow/unfollow user
- Request: `{ action: 'follow' | 'unfollow' }`
- Response: `{ isFollowing, followers_count }`

---

## 6. Auto-Scaling Policies

### 6.1 MediaConvert Transcoding Queue

```
Scaling Configuration:
├── Concurrency: Max 100 parallel jobs
├── Priority: High-priority queue for VIP users
├── Reserved Capacity: 10 concurrent slots (guaranteed)
├── Elasticity: Auto-burst to 100 during peak
└── Cost Control: Cap at 500 jobs/day per user
```

**Pricing Model:**
- Pay per minute of transcoding
- High-traffic periods (6 PM - midnight): Dynamic pricing
- Off-peak (midnight - 6 AM): 20% discount rate

### 6.2 Lambda Auto-Scaling (Image Optimization)

```
Configuration:
├── Reserved Concurrency: 10
├── Provisioned Concurrency: 5 (for cold starts)
├── Max Concurrency: 1000
├── Timeout: 300 seconds
└── Memory: 3008 MB (max allowed for fastest CPU)
```

**Metric-based Scaling:**
- Scale up if: AvailableExecutionConcurrency < 20%
- Scale down if: Duration < 5 seconds for 5 consecutive invocations

### 6.3 Database Connection Pooling

```
PostgreSQL (Neon):
├── Min Connections: 5
├── Max Connections: 100
├── Connection Timeout: 5 seconds
├── Idle Timeout: 15 minutes
└── Read Replicas: 2 (for high-traffic reads)
```

**Query Optimization:**
- Use connection pooling (PgBouncer)
- Index on `(user_id, created_at DESC)` for feed queries
- Partition tables by month after 6 months of data

---

## 7. Caching Strategy

### 7.1 Multi-Layer Cache

```
Layer 1: CDN (CloudFront)
├── Media files (videos, images): 365 days
├── Thumbnails: 7 days
└── Cost: Minimal (edge-optimized)

Layer 2: Redis (In-Memory)
├── User profiles: 1 hour
├── Feed metadata: 10 minutes
├── Trending lists: 1 hour
└── Session data: 24 hours

Layer 3: Database Query Cache
├── Complex queries: 5 minutes
├── Analytics: 30 minutes
└── User permissions: 15 minutes
```

### 7.2 Cache Invalidation Strategy

```
Event-based Invalidation:
├── On video upload completion
│   └── Invalidate: trending:videos:24h, user:{userId}:feed
├── On user follow
│   └── Invalidate: user:{userId}:profile, followers/following lists
├── On comment/like
│   └── Invalidate: video:{videoId}:metadata, engagement metrics
└── On profile update
    └── Invalidate: user:{userId}:profile
```

### 7.3 Cache Keys and TTLs

| Key Pattern | TTL | Update Trigger |
|---|---|---|
| `user:{userId}:profile` | 1h | Profile update, follow action |
| `video:{videoId}:feed` | 10m | Like, comment, view |
| `trending:videos:24h` | 1h | Engagement spike |
| `session:{sessionId}` | 24h | Login/logout |
| `image:{imageId}:variants` | 6h | Upload completion |

---

## 8. Cost Estimation (Monthly, assuming 100K daily active users)

| Service | Usage | Monthly Cost |
|---|---|---|
| S3 Storage | 500GB | $11 |
| S3 Data Transfer | 2TB | $184 |
| CloudFront CDN | 2TB | $150 |
| MediaConvert | 50K videos/month | $750 |
| Lambda (Image Optimization) | 50K images | $25 |
| PostgreSQL (Neon) | 100 concurrent conns | $50 |
| Redis (optional) | 100GB | $100 |
| **Total** | | **~$1,270/month** |

---

## 9. Monitoring & Observability

**CloudWatch Metrics to Monitor:**
```
├── S3: Requests/second, storage size, 4xx/5xx errors
├── CloudFront: Cache hit ratio, request latency, error rates
├── MediaConvert: Job completion time, failure rates, concurrency
├── Lambda: Duration, errors, cold start frequency
├── RDS: CPU, connections, query performance, replication lag
├── Redis: Evictions, memory usage, cache hit ratio
└── Application: API response times, error rates, user engagement
```

**Alerting Rules:**
- S3 request spike > 10K/sec → Scale up Lambda
- MediaConvert job failure rate > 1% → Page on-call engineer
- Database query latency > 100ms → Add read replica
- Cache hit ratio < 80% → Increase TTLs or Redis memory
- API error rate > 0.1% → Trigger incident response

---

## 10. Security Best Practices

**S3 Security:**
- Enable default encryption (AES-256)
- Block all public access by default
- Enable versioning and MFA delete
- Use bucket policies to restrict access
- CloudFront origin access identity (OAI) for signed requests

**API Security:**
- JWT token authentication on all endpoints
- Rate limiting: 100 requests/minute per user
- Input validation on uploads (file type, size, dimensions)
- Virus scanning on uploaded media (ClamAV)
- SQL injection prevention via parameterized queries

**Database Security:**
- SSL/TLS encryption in transit
- Row-level security for private content
- Automated backups (daily, 30-day retention)
- Audit logging for sensitive operations

---

## 11. Disaster Recovery & Backup

**Backup Strategy:**
```
Database:
├── Automated daily snapshots (Neon)
├── 30-day retention
└── Cross-region replication

S3:
├── Versioning enabled (90-day retention)
├── Cross-region replication to backup bucket
└── Lifecycle policies for cost optimization
```

**Recovery Time Objective (RTO):** < 1 hour
**Recovery Point Objective (RPO):** < 15 minutes

---

## Recommendation for Implementation

This document provides a **production-grade architecture**. For MVP implementation, start with:

1. **Minimal Setup:**
   - PostgreSQL (Neon) for metadata storage
   - S3 for media storage (single region)
   - CloudFront for CDN delivery
   - Skip MediaConvert initially; process videos asynchronously with ffmpeg

2. **Phase 2 (Scale):**
   - Add MediaConvert for professional transcoding
   - Implement Lambda for image optimization
   - Add Redis caching layer

3. **Phase 3 (Enterprise):**
   - Multi-region failover
   - Advanced monitoring and alerting
   - Cost optimization and capacity planning
