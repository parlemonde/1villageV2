# How to Deploy 1Village on AWS

This guide covers deploying the full 1Village stack on AWS:

- S3 bucket for build artifacts and assets
- SES for transactional emails
- PostgreSQL database
- Video transcoding Lambda (Rust)
- Next.js application server (EC2)

---

## Prerequisites

- An AWS account with admin or sufficient IAM permissions (S3, SES, EC2, Lambda)
- A domain name (e.g. `parlemonde.org`) managed in Route 53 (or equivalent)
- An EC2 instance running Amazon Linux 2023, with Node.js 24 installed via nvm
- [Rust](https://www.rust-lang.org/tools/install) and [Cargo Lambda](https://www.cargo-lambda.info/guide/installation.html) (for building the video transcoding Lambda)

---

## 1. S3 Bucket

The S3 bucket holds build artifacts (zipped application) and static assets.

1. Go to the **S3 Console** → **Create bucket**
2. Bucket name: `1village-plm`
3. Region: `eu-west-3` (Paris)
4. Leave the rest as default → **Create bucket**

### Enable versioning (recommended)

1. Click on the `1village-plm` bucket
2. Go to the **Properties** tab
3. Scroll to **Bucket Versioning** → **Edit**
4. Select **Enable** → **Save changes**

---

## 2. SES — Email Sending

Request production access and verify your domain in SES (eu-west-3).

### 2.1 Move out of sandbox

1. Go to the **SES Console** → **Account dashboard**
2. Click **Request production access**
3. Follow the wizard — describe that you send transactional emails to registered users

### 2.2 Verify the domain

You need to verify the domain used in the `from` address. The app sends from `ne-pas-repondre@{HOST_DOMAIN}`.

1. In the SES Console → **Verified identities** → **Create identity**
2. Choose **Domain** → enter `1v.parlemonde.org`
3. Leave **DKIM** enabled, select **Easy DKIM**
4. Click **Create identity**
5. AWS shows a TXT verification record and 3 DKIM CNAME records. Add all of them to your DNS zone (Route 53 or equivalent)

Once DNS propagates, the identity status turns to **Verified**.

### 2.3 Custom MAIL FROM (recommended)

1. Click on the `1v.parlemonde.org` identity
2. Go to the **MAIL FROM domain** section → **Edit**
3. Set MAIL FROM domain to `mail.1v.parlemonde.org` → **Save**
4. Add the MX record shown, plus a TXT SPF record, to your DNS

| Type | Name | Value |
|---|---|---|
| MX | `mail.1v.parlemonde.org` | `feedback-smtp.eu-west-3.amazonses.com` |
| TXT | `mail.1v.parlemonde.org` | `v=spf1 include:amazonses.com ~all` |

### 2.4 SMTP credentials

1. In the SES Console → **SMTP settings** → **Create SMTP credentials**
2. Follow the wizard to generate an IAM user with SMTP permissions
3. Note the **SMTP username** and **SMTP password** — they become `NODEMAILER_USER` and `NODEMAILER_PASS` in the env file

---

## 3. Video Transcoding Lambda (Rust)

The video transcoding function converts uploaded videos to HLS format (`.m3u8` playlists + `.ts` segments). It runs as an AWS Lambda function using the Rust runtime.

### 3.1 Build the Lambda

From the `server-transcode-videos/` directory:

```bash
cargo lambda build --release
```

This produces a binary at `target/lambda/server-transcode-videos/bootstrap`.

### 3.2 Create the ffmpeg Lambda layer

The Lambda needs `ffmpeg` at runtime. The repository includes a pre-built ARM64 layer zip:

```
server-transcode-videos/ffmpeg_arm64_layer.zip
```

If you need to rebuild it, package a static `ffmpeg` binary compiled for `aarch64-unknown-linux-gnu` into a zip where the binary is at `bin/ffmpeg`:

```bash
mkdir -p layer/bin
cp /path/to/ffmpeg-arm64 layer/bin/ffmpeg
cd layer && zip -r ../ffmpeg_arm64_layer.zip .
```

### 3.3 Create the Lambda function

1. Go to the **Lambda Console** → **Create function**
2. Choose **Author from scratch**
3. Function name: `server-transcode-videos`
4. Runtime: **Provide your own bootstrap on Amazon Linux 2023**
5. Architecture: **arm64**
6. Click **Create function**

### 3.4 Configure the Lambda

1. In the **Code** tab, upload the `bootstrap` binary from `target/lambda/server-transcode-videos/`
2. In the **Configuration** tab → **General configuration** → **Edit**:
   - **Memory**: `6144` MB
   - **Ephemeral storage**: `6144` MB
   - **Timeout**: `15` min (max: 15 min)
3. In the **Configuration** tab → **Environment variables**, add:
   - `AWS_REGION` → `eu-west-3`
   - `RUST_LOG` → `info`
4. In the **Code** tab → **Layers** → **Add a layer**:
   - Choose **Custom layers** → upload `ffmpeg_arm64_layer.zip` as a new layer
   - Or select an existing ffmpeg layer if already uploaded

### 3.5 Set up IAM permissions

Attach a policy to the Lambda execution role that allows S3 read/write on the `1village-plm` bucket:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
            "Resource": "arn:aws:s3:::1village-plm/*"
        }
    ]
}
```

### 3.6 Set the Lambda URL in the app env

Later, in the app environment file, set:

```
TRANSCODE_VIDEOS_LAMBDA_URL=https://lambda.eu-west-3.amazonaws.com
TRANSCODE_VIDEOS_LAMBDA_FUNCTION_NAME=server-transcode-videos
```

When `TRANSCODE_VIDEOS_LAMBDA_URL` is empty, video transcoding is disabled.

---

## 4. Production EC2 — Application Server

The main application runs on a single EC2 instance that hosts both the Next.js app and PostgreSQL.

### 4.1 Launch EC2

- AMI: Amazon Linux 2023
- Instance type: at least t3.medium (PostgreSQL needs RAM)
- Security group:
  - Port **3000** (app): open to CloudFront origin-facing IP ranges only (see note below)
  - Port **22** (SSH): open to your IP only
  - Port **5432** (PostgreSQL): open to your IP only

> **CloudFront IP ranges**: In the EC2 Security Group, do NOT open port 3000 to `0.0.0.0/0`. Instead, use the [AWS-managed prefix list for CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/LocationsOfEdgeServers.html) (`com.amazonaws.global.cloudfront.origin-facing`) as the source. If your region does not support managed prefix lists, download the CloudFront IP ranges from the link above and add each CIDR individually.

### 4.2 Install Node.js 24

```bash
# On the production EC2
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
. ~/.bashrc
nvm install 24
nvm alias default 24
```

Verify:

```bash
node --version   # should be v24.x
```

### 4.3 Install and set up PostgreSQL

```bash
sudo dnf install -y postgresql15-server
sudo postgresql-setup --initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 4.4 Create database and application user

Connect as the `postgres` system superuser:

```bash
sudo -u postgres psql
```

Then inside psql:

```sql
CREATE USER "1VillageOwner" WITH PASSWORD '<generate-a-db-password>';
CREATE DATABASE un_village OWNER "1VillageOwner";
GRANT ALL PRIVILEGES ON DATABASE un_village TO "1VillageOwner";
\c un_village
GRANT ALL ON SCHEMA public TO "1VillageOwner";
\q
```

Generate the DB password:

```bash
node -e "console.log(require('crypto').randomBytes(12).toString('base64url'))"
```

### 4.5 Create the environment file

On the production EC2, create `/home/ec2-user/1village.env`:

```bash
cat > /home/ec2-user/1village.env << 'EOF'
NODE_ENV=production
NEXT_RUNTIME=nodejs
BETTER_AUTH_SECRET=<generate>
BETTER_AUTH_URL=https://1v.parlemonde.org
HOST_URL=https://1v.parlemonde.org
ADMIN_PASSWORD=<generate>
ADMIN_EMAIL=<admin-email>
DATABASE_URL=postgresql://1VillageOwner:<db-password>@localhost:5432/un_village
AWS_ACCESS_KEY_ID=<iam-access-key>
AWS_SECRET_ACCESS_KEY=<iam-secret-key>
AWS_REGION=eu-west-3
S3_BUCKET_NAME=1village-plm
HOST_DOMAIN=1v.parlemonde.org
NODEMAILER_USER=<ses-smtp-username>
NODEMAILER_PASS=<ses-smtp-password>
NODEMAILER_HOST=email-smtp.eu-west-3.amazonaws.com
NODEMAILER_PORT=587
TRANSCODE_VIDEOS_LAMBDA_URL=https://lambda.eu-west-3.amazonaws.com
TRANSCODE_VIDEOS_LAMBDA_FUNCTION_NAME=server-transcode-videos
OTEL_EXPORTER_OTLP_ENDPOINT=<otel-endpoint>
# Optional SSO
# CLIENT_ID=<sso-client-id>
# CLIENT_SECRET=<sso-client-secret>
# SSO_BASE_URL=https://professeur.parlemonde.org
# Optional weather
# OPEN_WEATHER_APP_ID=<api-key>
EOF
```

Generate secrets:

```bash
# BETTER_AUTH_SECRET (32-char hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ADMIN_PASSWORD
node -e "console.log(require('crypto').randomBytes(12).toString('base64url'))"
```

Set restrictive permissions:

```bash
chmod 600 /home/ec2-user/1village.env
```

### Environment variables reference

| Variable | Description |
|---|---|
| `NODE_ENV` | Set to `production` (enables OpenTelemetry, stricter password rules) |
| `NEXT_RUNTIME` | `nodejs` |
| `BETTER_AUTH_SECRET` | Auth signing secret — **must be changed from default** |
| `BETTER_AUTH_URL` | Base URL for auth callbacks |
| `HOST_URL` | Application base URL |
| `ADMIN_PASSWORD` | Initial admin password (used by migration seed) |
| `ADMIN_EMAIL` | Initial admin email (used by migration seed) |
| `DATABASE_URL` | PostgreSQL connection string |
| `AWS_ACCESS_KEY_ID` | IAM access key for S3 and Lambda |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key |
| `AWS_REGION` | AWS region (`eu-west-3`) |
| `S3_BUCKET_NAME` | S3 bucket name (`1village-plm`) — empty = local file storage |
| `HOST_DOMAIN` | Domain used in the email `from` address (`ne-pas-repondre@{domain}`) |
| `NODEMAILER_USER` | SES SMTP username |
| `NODEMAILER_PASS` | SES SMTP password |
| `NODEMAILER_HOST` | SMTP host (`email-smtp.eu-west-3.amazonaws.com`) |
| `NODEMAILER_PORT` | SMTP port (`587`) |
| `TRANSCODE_VIDEOS_LAMBDA_URL` | Lambda invocation URL — empty = transcoding disabled |
| `TRANSCODE_VIDEOS_LAMBDA_FUNCTION_NAME` | Lambda function name (`server-transcode-videos`) |
| `CLIENT_ID` | Par Le Monde OAuth client ID — empty = SSO disabled |
| `CLIENT_SECRET` | Par Le Monde OAuth client secret |
| `SSO_BASE_URL` | OAuth provider base URL (`https://professeur.parlemonde.org`) |
| `OPEN_WEATHER_APP_ID` | OpenWeatherMap API key (optional) |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OpenTelemetry collector endpoint |

### 4.6 Create 1village.service

```bash
sudo tee /etc/systemd/system/1village.service << 'EOF'
[Unit]
Description=1Village server
After=network.target

[Service]
WorkingDirectory=/home/ec2-user/1village
EnvironmentFile=/home/ec2-user/1village.env
Restart=on-failure
RestartSec=1s
User=ec2-user
Group=users

ExecStart=/home/ec2-user/.nvm/versions/node/v24.11.1/bin/node server.js

[Install]
WantedBy=multi-user.target
EOF
```

Adjust the Node.js path to the actual installed version:

```bash
sudo sed -i "s|/home/ec2-user/.nvm/versions/node/.*/bin/node|$(nvm which node)|" /etc/systemd/system/1village.service
sudo systemctl daemon-reload
```

### 4.7 Create the deploy script

On the production EC2, create `/home/ec2-user/deploy.sh`:

```bash
cat > /home/ec2-user/deploy.sh << 'EOF'
#!/bin/bash
sudo systemctl stop 1village.service
aws s3 cp s3://1village-plm/builds/$1/1village.zip . --quiet
aws s3 rm s3://1village-plm/assets/ --recursive --quiet
aws s3 cp s3://1village-plm/builds/$1/assets/ s3://1village-plm/assets/ --recursive --quiet
rm -rf 1village
unzip -qq 1village.zip -d 1village
rm -rf 1village.zip
sudo systemctl start 1village.service
EOF

chmod +x /home/ec2-user/deploy.sh
```

The script takes a commit SHA as its first argument (`$1`). It downloads the build from `s3://1village-plm/builds/$1/` and syncs its assets to the live `s3://1village-plm/assets/` path.

### 4.8 Install Puppeteer for PDF generation

The app uses Puppeteer (headless Chrome) to generate PDFs. Install the browser and its system dependencies:

```bash
npx puppeteer browsers install chrome
sudo dnf install -y \
  libXcomposite libXdamage libXrandr libxkbcommon \
  pango alsa-lib atk at-spi2-atk cups-libs libdrm mesa-libgbm
```

---

## 5. CloudFront CDN

Create a CloudFront distribution that sits in front of both the S3 assets bucket and the EC2 app server.

### 5.1 Create the distribution

1. Go to the **CloudFront Console** → **Create distribution**
2. Under **Origin**, fill in:

#### Origin 1 — S3 assets

- **Origin domain**: select the `1village-plm` bucket from the dropdown (it should appear as `1village-plm.s3.eu-west-3.amazonaws.com`)
- **Origin path**: `/assets`

#### Origin 2 — EC2 application server

- Click **Add origin**
- **Origin domain**: enter the EC2 public DNS (e.g. `ec2-xx-xx-xx-xx.eu-west-3.compute.amazonaws.com`)
- **Protocol**: HTTP only
- **HTTP port**: `3000`
- Leave origin path empty

### 5.2 Cache behaviors (ordered — most specific first)

After creating the origins, configure the following cache behaviors. They are evaluated in order; put the most specific paths first.

| Precedence | Path pattern | Origin | Cache policy |
|---|---|---|---|
| 0 | `_next/static/*` | S3 | *(any managed policy, content is fingerprinted)* |
| 1 | `favicon.ico` | S3 | *(any managed policy)* |
| 2 | `static/*` | S3 | *(any managed policy)* |
| 3 | `media/*` | EC2 | `CachingOptimized` with `UseOriginCacheControlHeaders-QueryStrings` |
| 4 | `Default (*)` | EC2 | `CachingDisabled` |

For behavior 3 (`media/*`):

- In the **Cache key and origin requests** section, select **Cache policy** → choose `CachingOptimized`
- Then, select **Origin request policy** → choose `UseOriginCacheControlHeaders-QueryStrings`

For behavior 4 (Default `*`):

- Set **Cache policy** to `CachingDisabled` (this ensures dynamic HTML pages are never cached)

### 5.3 Alternate domain name & SSL

1. Under **Settings** → **Alternate domain name (CNAME)**, add `1v.parlemonde.org`
2. In **Custom SSL certificate**, request or select a certificate for `1v.parlemonde.org` (via ACM)
3. Click **Create distribution**

### 5.4 Route the domain to CloudFront

In your DNS (Route 53), point `1v.parlemonde.org` to the CloudFront distribution domain name (`d1234.cloudfront.net`) using an ALIAS (A) record.

---

## 6. Run Database Migrations

The first time you deploy (and after any schema change), run the migration script.

You can do this from your local machine (with `DATABASE_URL` pointing to the EC2) or from CI:

```bash
# From your local machine (with DATABASE_URL pointing to the EC2)
DATABASE_URL=postgresql://1VillageOwner:<password>@<ec2-ip>:5432/un_village?sslmode=disable \
  pnpm tsx src/server/database/migrate.ts
```

If `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set, the migration also seeds the admin user and the default French language.

> Once CI is set up, migrations run automatically as part of the Deploy workflow (see section 11).

---

## 7. First Build and Deploy

### 7.1 Build and upload via CI (recommended)

Push to `main` — the **Build** workflow (`.github/workflows/build.yml`) will:

1. Check out the repo
2. Install dependencies and run `pnpm build`
3. Prepare the standalone output + static assets
4. Upload the zip and assets to `s3://1village-plm/builds/${{ github.sha }}/`

When the Build succeeds, the **Deploy** workflow (`.github/workflows/deploy.yml`) automatically:

1. Opens the security group for the GitHub Actions runner IP
2. Runs database migrations
3. SSHes into the EC2 and runs `./deploy.sh <sha>`
4. Revokes the security group ingress
5. Notifies the dev portal of the new live commit

### 7.2 Build and upload manually

```bash
pnpm install
pnpm build
```

The build produces a standalone Node.js output in `.next/standalone/`. Prepare the artifacts:

```bash
mkdir -p dist/assets/_next
mv .next/static dist/assets/_next
cp -r public/* dist/assets
cp -r public .next/standalone
(cd .next/standalone && zip --symlinks -r - .) > dist/1village.zip
```

Upload to S3 (replace `<sha>` with your commit hash):

1. Go to the **S3 Console** → open the `1village-plm` bucket
2. Navigate into `builds/` → create a folder named `<sha>`
3. Inside `<sha>/`, click **Upload** → **Add files**
4. Select `dist/1village.zip` and everything under `dist/assets/`
5. Click **Upload**

### 7.3 Deploy manually

SSH into the production EC2 and run with the commit sha:

```bash
ssh ec2-user@<prod-ec2-ip> "./deploy.sh <sha>"
```

The deploy script stops the service, downloads the build from `s3://1village-plm/builds/<sha>/`, syncs assets to `s3://1village-plm/assets/`, unpacks the app, and starts the service.

---

## 8. Optional — SSO Configuration

To connect 1Village to the Par Le Monde OAuth provider, set these variables in `/home/ec2-user/1village.env`:

```
CLIENT_ID=<sso-client-id>
CLIENT_SECRET=<sso-client-secret>
SSO_BASE_URL=https://professeur.parlemonde.org
```

When `CLIENT_ID` and `CLIENT_SECRET` are both non-empty, the "Par Le Monde" SSO login button appears. When either is empty, SSO is disabled.

Then restart the service:

```bash
sudo systemctl restart 1village.service
```

---

## 9. Rollback

To roll back to a previous build, use the **Rollback** workflow from the GitHub Actions tab:

1. Go to your GitHub repo → **Actions** → **Rollback to specific build** → **Run workflow**
2. Enter the full SHA of the commit you want to roll back to
3. Click **Run workflow**

This opens the security group for SSH, runs `./deploy.sh <sha>` on the EC2 (which pulls the build from `s3://1village-plm/builds/<sha>/`), and notifies the dev portal.

To roll back manually, SSH into the production EC2 and run:

```bash
ssh ec2-user@<prod-ec2-ip> "./deploy.sh <previous-sha>"
```

---

## 10. Useful Commands

```bash
# Check service status
sudo systemctl status 1village.service

# View logs
sudo journalctl -u 1village.service -f

# Restart the app
sudo systemctl restart 1village.service

# Check PostgreSQL status
sudo systemctl status postgresql
```

To browse uploaded builds, open the **S3 Console** → `1village-plm` bucket → `builds/`.

---

## 11. GitHub Actions Secrets

The CI/CD pipelines (`.github/workflows/build.yml`, `deploy.yml`, `rollback.yml`) require the following secrets configured in the repository.

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

### Build workflow

| Secret name | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM access key ID with S3 write permissions |
| `AWS_SECRET_ACCESS_KEY` | IAM secret access key |
| `AWS_REGION` | `eu-west-3` |
| `AWS_BUCKET_NAME` | `1village-plm` |

### Deploy workflow

| Secret name | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM access key ID (same as above, needs S3 + EC2 permissions) |
| `AWS_SECRET_ACCESS_KEY` | IAM secret access key |
| `AWS_REGION` | `eu-west-3` |
| `AWS_SECURITY_GROUP_NAME` | Name of the EC2 security group (e.g. `1village-sg`) |
| `DATABASE_URL` | `postgresql://1VillageOwner:<password>@<ec2-ip>:5432/un_village?sslmode=disable` |
| `SSH_PRIVATE_KEY` | PEM private key for SSH access to the EC2 instance |
| `SSH_KNOWN_HOSTS` | SSH known hosts entry for the EC2 instance |
| `SERVER_URL` | SSH connection string (e.g. `ec2-user@<ec2-ip>`) |
| `DEV_PORTAL_URL` | Dev portal base URL (optional, for deploy-state tracking) |
| `DEV_PORTAL_DEPLOY_TOKEN` | Bearer token for the dev portal API (optional) |

### Rollback workflow

Uses the same secrets as the Deploy workflow (`AWS_*`, `AWS_SECURITY_GROUP_NAME`, `SSH_*`, `SERVER_URL`, and `DEV_PORTAL_*`).

### How to obtain each secret

**IAM credentials** (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`): Create an IAM user with `AmazonS3FullAccess` and `AmazonEC2FullAccess` policies. Generate an access key in the IAM Console.

**Security group** (`AWS_SECURITY_GROUP_NAME`): Use the name of the security group attached to your EC2 instance (visible in the EC2 Console). This is used by the deploy workflow to temporarily allow the GitHub Actions runner IP for SSH and DB access.

**Database URL** (`DATABASE_URL`): Same value as in `1village.env`, but use the EC2 public IP instead of `localhost` so the GitHub runner can reach it.

**SSH credentials** (`SSH_PRIVATE_KEY`, `SSH_KNOWN_HOSTS`, `SERVER_URL`):

- `SSH_PRIVATE_KEY`: the content of the `.pem` key file used to SSH into the EC2 (`cat ~/.ssh/1village-key.pem`)
- `SSH_KNOWN_HOSTS`: run `ssh-keyscan <ec2-ip>` and use the output
- `SERVER_URL`: `ec2-user@<ec2-ip>`

### Re-enable workflows

Go on the actions page: [https://github.com/parlemonde/1village-v2/actions](https://github.com/parlemonde/1village-v2/actions)

→ Select a disabled workflow in the list on the left, and enable it.
