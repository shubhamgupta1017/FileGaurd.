import React, { useState } from 'react';

function App() {
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  const [verifyFile, setVerifyFile] = useState(null);
  const [merkleFile, setMerkleFile] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);

  const handleUpload = async () => {
    if (!uploadFile) return alert("Select a file to upload");
    const formData = new FormData();
    formData.append('file', uploadFile);
  
    const res = await fetch('http://localhost:4000/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setUploadResult(data);
  
    if (data.status === 'success') {
      // Auto-download the Merkle JSON file
      const merkleFileUrl = `http://localhost:4000/${data.merkleTreeFile}`;
      const merkleResponse = await fetch(merkleFileUrl);
      const merkleBlob = await merkleResponse.blob();
  
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(merkleBlob);
      downloadLink.download = data.merkleTreeFile;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
    }
  };
  

  const handleVerify = async () => {
    if (!verifyFile || !merkleFile) return alert("Select both file and Merkle JSON");
    const formData = new FormData();
    formData.append('file', verifyFile);
    formData.append('merkleTree', merkleFile);

    const res = await fetch('http://localhost:4000/verify', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setVerifyResult(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload File & Generate Merkle Tree</h2>
      <input type="file" onChange={e => setUploadFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload & Generate</button>

      {uploadResult && (
        <div>
          <p><b>Root Hash:</b> {uploadResult.rootHash}</p>
          <a href={`http://localhost:4000/${uploadResult.merkleTreeFile}`} download>Download Merkle Tree JSON</a>
        </div>
      )}

      <hr />

      <h2>Verify File Using Merkle Tree</h2>
      <input type="file" onChange={e => setVerifyFile(e.target.files[0])} /> <br />
      <input type="file" onChange={e => setMerkleFile(e.target.files[0])} /> <br />
      <button onClick={handleVerify}>Verify</button>

      {verifyResult && (
  <div>
    <p><b>Root Hash Matches:</b> {verifyResult.rootMatches ? 'Yes' : 'No'}</p>
    <p><b>Corrupted Chunks:</b> {verifyResult.corruptedChunks ?? '-'} / {verifyResult.totalChunks ?? '-'}</p>
    <p><b>Corruption Percentage:</b> {verifyResult.corruptionPercentage !== undefined 
      ? verifyResult.corruptionPercentage.toFixed(2) 
      : '-' }%</p>
  </div>
)}

    </div>
  );
}

export default App;
