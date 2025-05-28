## 🚀 Key Features

* **Granular Chunking**
  Dynamically divides files into at least 50 segments for fine-grained verification.

* **Secure Hashing**
  Encodes each chunk in Base64 and hashes with SHA-256 for consistent, tamper-proof digests.

* **Merkle Tree Construction**
  Recursively concatenates and hashes pairs of chunk hashes to compute a single Merkle root.

* **REST API**

  * `POST /upload` — Accepts file upload, returns Merkle JSON and root hash
  * `POST /verify` — Accepts original file + Merkle JSON, returns verification report

* **Automatic Download**
  Client-side download of generated Merkle JSON immediately after upload.

* **Detailed Reports**
  Displays root match status, corrupted-chunk count, and corruption percentage.

* **CORS Enabled**
  Seamless frontend-backend communication.

---

## 🏗️ Architecture Overview

```
merkle-backend/
├── index.js               # Express server with file handling & Merkle logic
├── MerkleTree.js          # Merkle tree implementation
└── uploads/               # Stored files & Merkle JSON outputs

merkle-frontend/
├── src/
│   └── App.js             # React component for upload & verification UI
└── package.json           # Frontend dependencies & scripts
```

---

## ⚙️ Prerequisites

* Node.js v14+
* npm (Node Package Manager)
* Git (optional)

---

## 📦 Installation & Setup

### Backend

```bash
cd path/to/merkle-backend
npm install
node index.js
```

> *Server runs on **port 4000** by default.*

### Frontend

```bash
cd path/to/merkle-frontend
npm install
npm start
```

> *App runs on **port 3000** by default.*

---

## 🎯 Usage

### 1. Upload & Generate

1. Click **Upload & Generate**.
2. File is chunked, hashed, and Merkle tree is built.
3. Downloadable Merkle JSON appears; Merkle root is displayed.

### 2. Verify Integrity

1. Select **Original File** and **Merkle JSON**.
2. Click **Verify**.
3. View report:

   * Root match (✔️ / ❌)
   * Corrupted chunks count
   * Corruption percentage

---

## 🛠️ Implementation Details

* **Chunking**: Ensures ≥50 chunks, even for small files.
* **Hashing**: Base64-encode then SHA-256 hash each chunk.
* **Tree Build**: Pairwise concatenate hashes; if odd, duplicate last.
* **API Endpoints**:

  * `/upload` handles file → returns JSON + root
  * `/verify` handles file + JSON → returns verification data
* **Static Hosting**: `uploads/` served for JSON retrieval.
* **CORS**: Configured in `index.js`.

---

## 📋 Dependencies

### Backend

* `express`
* `multer`
* `cors`
* `crypto` (built-in)

### Frontend

* React (via Create React App)
* Fetch API (native)

---

## 🔍 Troubleshooting

* Run `npm install` in both `merkle-backend/` and `merkle-frontend/`.
* Confirm backend is listening on port 4000.
* Inspect browser console & server logs for errors.
* Verify correct file + Merkle JSON pairing.

---

## 📄 License

MIT License. Contributions welcome—please open issues or PRs!

---
