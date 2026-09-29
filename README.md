# Fluvid

Fluvid is a Vue-based web application that enables multiple users to collaborate on video projects, upload media, and edit multi-track timelines directly in the browser. It uses AWS Cognito for user authentication, Amazon S3 for source video storage, and GraphQL subscriptions to reflect project changes in real time.

## Features

- Email-based registration, verification-code confirmation, sign-in, and sign-out
- Project creation, renaming, and listing
- Project member invitations and `admin`/`participants` role management
- Configurable project duration and additional video tracks
- Drag-and-drop video upload and timeline placement
- Clip repositioning, automatic adjustment of overlapping clips, and playhead-based splitting
- Per-clip opacity controls
- 24 FPS timeline playback and GPU.js-powered multi-track compositing preview
- Real-time synchronization of project, video, track, and clip changes through GraphQL WebSocket subscriptions

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | Vue 2, Vue Router, Vue CLI |
| UI | Element UI, Vuesax, SimpleBar |
| Data | Vue Apollo, GraphQL queries, mutations, and subscriptions |
| Authentication and storage | AWS Amplify, Amazon Cognito, Amazon S3 |
| Video processing | HTML Video API, GPU.js |
| Deployment | AWS CodeBuild, CodeDeploy, and EC2 deployment scripts |

## Architecture

```text
Browser
├── AWS Cognito             User registration, authentication, and JWT issuance
├── GraphQL HTTP/WebSocket  Project data updates and real-time subscriptions
└── Amazon S3               Uploaded video storage and playback
```

The Cognito ID token is attached to GraphQL requests as `Authorization: Bearer <token>`. The Amplify backend definitions in this repository include Cognito, S3, and an S3 event-triggered Lambda function. The GraphQL API and schema used by the application must be provided separately.

## Getting Started

### Prerequisites

- Node.js 14.x
- Yarn Classic 1.x
- Accessible GraphQL HTTP and WebSocket endpoints
- AWS Amplify configuration connected to the project

The deployment script pins Node.js to `14.7.0`, and `yarn.lock` uses the Yarn Classic format. Because the project contains legacy dependencies, starting with these versions is recommended.

### 1. Install Dependencies

```bash
yarn install
```

### 2. Prepare the AWS Amplify Configuration

`src/main.js` imports `src/aws-exports.js`, but this environment-specific file is excluded from Git. Prepare it using one of the following methods:

- Connect to the existing project and environment with the Amplify CLI, then run `amplify pull`.
- Obtain the environment's `aws-exports.js` from the project administrator and place it at `src/aws-exports.js`.

The configuration must contain the Cognito and S3 settings used by the application. Do not commit AWS credentials or secrets to the repository.

### 3. Configure the GraphQL Endpoints

Copy `.env.example` to `.env.local` and replace the placeholders with endpoints for your development environment:

```dotenv
VUE_APP_GRAPHQL_HTTP=https://example.com/graphql/v1/graphql
VUE_APP_GRAPHQL_WS=wss://example.com/graphql/v1/graphql
VUE_APP_S3_PUBLIC_URL=https://example-bucket.s3.example-region.amazonaws.com
```

| Variable | Description | When omitted |
| --- | --- | --- |
| `VUE_APP_GRAPHQL_HTTP` | GraphQL HTTP endpoint for queries and mutations | Required; the app fails fast when it is missing |
| `VUE_APP_GRAPHQL_WS` | GraphQL WebSocket endpoint for subscriptions | Required; the app fails fast when it is missing |
| `VUE_APP_S3_PUBLIC_URL` | S3 bucket base URL for public video assets | Required; the app fails fast when it is missing |
| `VUE_APP_APOLLO_ENGINE_SERVICE` | Apollo CLI service name (optional) | Not configured |
| `VUE_APP_APOLLO_ENGINE_KEY` | Apollo CLI API key (optional) | Not configured |
| `APOLLO_ENGINE_API_ENDPOINT` | Apollo Engine API endpoint (optional) | Not configured |

`.env.local` is excluded from Git. Vue CLI reads environment variables when the development server starts, so restart the server after changing these values.

### 4. Start the Development Server

```bash
yarn serve
```

Open the local URL displayed in the terminal. The root route checks the current authentication state and redirects to either the project list or the sign-in page.

## Available Commands

| Command | Description |
| --- | --- |
| `yarn serve` | Starts the development server with hot reload |
| `yarn build` | Creates an optimized production build in `dist/` |
| `yarn lint` | Checks Vue and JavaScript files with ESLint |

No automated test command is currently defined.

## Routes

The router uses hash mode, so browser URLs include `/#/`.

| Route | View |
| --- | --- |
| `/` | Redirects to the sign-in page or project list based on authentication state |
| `/register` | Registration and verification-code confirmation |
| `/login` | Sign-in |
| `/projects` | Project list, project creation, and project settings |
| `/project/:id` | Video upload and multi-track timeline editor |

## Basic Workflow

1. Register and enter the verification code received by email, or sign in with an existing account.
2. Create a project from the project list.
3. Set the project duration and invite collaborators from the project settings.
4. Drop video files onto the lower-left area of the editor to upload them to S3.
5. Drag uploaded videos onto the desired tracks and adjust their positions on the timeline.
6. Move the playhead to preview the result, split clips, or adjust their opacity.

The upload area only processes files whose MIME type matches `video/*`. The timeline uses 24 pixels and 24 frames per second, and the compositing preview is rendered at 800×450.

## Project Structure

```text
.
├── src/
│   ├── components/       Project cards and the new-project card
│   ├── views/            Sign-in, registration, project list, and editor views
│   ├── router/           Hash-based route definitions
│   ├── assets/           Images and sample videos
│   ├── main.js           Vue and Amplify initialization
│   └── vue-apollo.js     GraphQL HTTP/WS client and authentication settings
├── amplify/
│   └── backend/          Cognito, S3, and Lambda infrastructure definitions
├── public/               Static HTML and favicon
├── buildspec.yml         CodeBuild artifact configuration
├── appspec.yml           CodeDeploy deployment and hook configuration
├── before.sh             Deployment directory initialization
└── build.sh              Dependency installation and production build on EC2
```

## Deployment

The deployment configuration in this repository assumes the following workflow:

1. CodeBuild packages the source and deployment scripts into `frontend.zip`.
2. CodeDeploy copies the artifact to `/home/ubuntu` on an EC2 instance.
3. `before.sh` prepares `/home/ubuntu/deploy`.
4. `build.sh` requires the separately provisioned `/home/ubuntu/aws-exports.js` and the `VUE_APP_GRAPHQL_HTTP`, `VUE_APP_GRAPHQL_WS`, and `VUE_APP_S3_PUBLIC_URL` environment variables.
5. It copies `aws-exports.js` into `src/`, then runs `yarn install` and `yarn build` with Node.js 14.7.0 to generate `dist/`.

These scripts assume that the expected EC2 directory structure, NVM, Yarn, and `aws-exports.js` have already been provisioned. Web server configuration for serving the generated static files is not included in this repository.

## Development Notes

- The GraphQL endpoints and public S3 base URL are injected through `VUE_APP_*` variables at build time; no environment-specific endpoint is hardcoded in the source.
- The GraphQL operations assume the existence of `projects`, `permission`, `user`, `videos`, `tracks`, and `clips` tables and their related queries, mutations, and subscriptions.
- The Cognito ID token is also passed when establishing authenticated GraphQL WebSocket connections.
- Korean translation resources exist under `src/lang/`, but i18n initialization is currently disabled in `src/main.js`.
- This repository does not currently include a license file.
