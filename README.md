<div align="center">
  <h1>📸 FaceHash</h1>
  <p><strong>A secure, cryptographic facial recognition and biometric authentication platform.</strong></p>
</div>

<br />

## 🔒 About The Project

FaceHash is an academic cybersecurity project demonstrating how to securely capture, mathematically hash, and cryptographically protect human biometric data. 

Unlike traditional platforms that store highly sensitive face images directly in databases, **FaceHash never saves a single photo**. Instead, it utilizes client-side capture and advanced neural networks to extract a unique 128-dimensional mathematical map of a user's face. This "face hash" is then heavily scrambled using **AES-256-CBC encryption** before it ever touches a database, ensuring that even in the event of a catastrophic server breach, user biometric identities remain entirely mathematically irreversible.

This project consists of three main pillars:
1. **The Mobile App (Expo / React Native)**: A sleek interface that accesses the device camera, guides the user through facial capture, and communicates securely with the API.
2. **The WASM Processing Server (Node.js)**: A highly portable backend leveraging WebAssembly (`@tensorflow/tfjs-backend-wasm`) and Rust native modules (`@napi-rs/canvas`) to perform complex neural network mathematics entirely on the CPU without requiring local Python or C++ build tools.
3. **The Secure Database Core (PostgreSQL / Supabase)**: The final encrypted storage facility for the AES-256 ciphertexts.

---

## 🛠️ The Technology Stack

- **Mobile Client**: React Native, Expo SDK 55, React Navigation
- **Backend API**: Node.js, Express, Axios
- **Biometric Processing**: `@vladmandic/face-api`, TensorFlow.js WASM Engine, NAPI-RS Canvas
- **Cryptography**: Node.js Native Crypto (AES-256-CBC, Random IV)
- **Database Architecture**: PostgreSQL (via Supabase)

---

## 📚 Technical Documentation

We have exhaustively documented the architecture, cryptographic decisions, and setup processes required to run this project:

- [**System Architecture & Data Flow**](docs/architecture.md): Visual Mermaid diagrams explaining the registration and login pipelines.
- [**The Security Model**](docs/security.md): A deep dive into *why* AES-256-CBC is used, how Initialization Vectors (IVs) ensure semantic security, and the privacy benefits of embeddings over raw images.
- [**Project Configuration & Setup**](docs/project_setup.md): A step-by-step technical guide to spinning up the Node server, downloading the neural network models, generating AES keys, and configuring the Expo mobile app.
- [**REST API Reference**](docs/api.md): Developer documentation for the `/register`, `/login`, and `/users` testing endpoints.

### Academic Research & Issue Resolution
For academic grading and review, the `docs/academic/` folder contains extensive post-mortem documentation detailing how severe native compilation issues (Node-GYP, Python, and C++ dependency chains) were successfully bypassed using WebAssembly architectures.

---

## 🚀 Quick Start Preview

*(To run the full project locally, please see [**Project Configuration & Setup**](docs/project_setup.md)).*

```bash
# 1. Start the Cryptographic Processing Server
cd backend
npm install
node scripts/downloadModels.js
npm start

# 2. Launch the FaceHash Mobile Client
cd ../mobile-app
npx expo start -c
```
