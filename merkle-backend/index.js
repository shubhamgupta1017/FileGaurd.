const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Serve static files from 'uploads' folder
app.use(express.static(path.join(__dirname, 'uploads')));

// Multer storage config with absolute path
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Hash function: sha256 hex digest
const hash = (data) => crypto.createHash('sha256').update(data).digest('hex');

// Build Merkle tree from array of hashed leaves (hex strings)
const buildMerkleTree = (hashedLeaves) => {
  let leaves = [...hashedLeaves]; // copy array
  const originalLeaves = [...leaves];

  while (leaves.length > 1) {
    if (leaves.length % 2 !== 0) {
      leaves.push(leaves[leaves.length - 1]); // duplicate last leaf if odd number
    }
    const newLevel = [];
    for (let i = 0; i < leaves.length; i += 2) {
      // Concatenate hex hashes as strings and hash the result
      newLevel.push(hash(leaves[i] + leaves[i + 1]));
    }
    leaves = newLevel;
  }

  return { root: leaves[0], leaves: originalLeaves };
};

// Upload route
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    const minChunks = 50;
    const chunkSize = Math.ceil(fileBuffer.length / minChunks);
    const chunks = [];

    for (let i = 0; i < fileBuffer.length; i += chunkSize) {
    const chunkBuffer = fileBuffer.slice(i, i + chunkSize);
    chunks.push(chunkBuffer.toString('base64'));
    }


    // Hash each base64 chunk
    const hashedLeaves = chunks.map(chunkBase64 => hash(chunkBase64));

    // Build Merkle tree
    const merkleTree = buildMerkleTree(hashedLeaves);

    // Save Merkle tree to JSON
    const merkleFilename = req.file.filename + '_merkle.json';
    const merklePath = path.join(__dirname, 'uploads', merkleFilename);
    fs.writeFileSync(merklePath, JSON.stringify(merkleTree, null, 2));

    res.json({
      status: 'success',
      originalFile: req.file.filename,
      merkleTreeFile: merkleFilename
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Upload failed.', error: err.message });
  }
});

// Verify route
app.post('/verify', upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'merkleTree', maxCount: 1 }
]), (req, res) => {
  try {
    const fileBuffer = fs.readFileSync(req.files.file[0].path);
    const merkleTreeData = JSON.parse(fs.readFileSync(req.files.merkleTree[0].path, 'utf-8'));

    const minChunks = 50;
    const chunkSize = Math.ceil(fileBuffer.length / minChunks);
    const chunks = [];

    for (let i = 0; i < fileBuffer.length; i += chunkSize) {
    const chunkBuffer = fileBuffer.slice(i, i + chunkSize);
    chunks.push(chunkBuffer.toString('base64'));
    }


    // Hash each chunk base64 string
    const leaves = chunks.map(chunkBase64 => hash(chunkBase64));

    const originalLeaves = merkleTreeData.leaves || [];

    // Count corrupted chunks by comparing leaves
    let corruptedChunks = 0;
    for (let i = 0; i < leaves.length; i++) {
      if (originalLeaves[i] !== leaves[i]) corruptedChunks++;
    }

    // Rebuild Merkle root from newly computed leaves
    let computedLeaves = [...leaves];
    while (computedLeaves.length > 1) {
      if (computedLeaves.length % 2 !== 0) {
        computedLeaves.push(computedLeaves[computedLeaves.length - 1]);
      }
      const newLevel = [];
      for (let i = 0; i < computedLeaves.length; i += 2) {
        newLevel.push(hash(computedLeaves[i] + computedLeaves[i + 1]));
      }
      computedLeaves = newLevel;
    }
    const computedRoot = computedLeaves[0];

    const originalRoot = merkleTreeData.root;
    const rootMatches = computedRoot === originalRoot;
    const totalChunks = chunks.length;
    const corruptionPercentage = (corruptedChunks / totalChunks) * 100;

    res.json({
      rootMatches,
      corruptedChunks,
      totalChunks,
      corruptionPercentage
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Verification failed.', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
