// merkle-backend/MerkleTree.js
const crypto = require('crypto');

class MerkleTree {
  constructor(leaves) {
    this.leaves = leaves.map(data => this.hash(data));
    this.layers = [this.leaves];
    this.createTree();
  }

  hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  createTree() {
    let currentLayer = this.leaves;
    while (currentLayer.length > 1) {
      const nextLayer = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i];
        const right = i + 1 < currentLayer.length ? currentLayer[i + 1] : left;
        nextLayer.push(this.hash(left + right));
      }
      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }
  }

  getRoot() {
    return this.layers[this.layers.length - 1][0];
  }

  getLayers() {
    return this.layers;
  }
}

module.exports = MerkleTree;
