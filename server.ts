import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import { Block, Vote, Candidate, BlockchainStatus } from "./src/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// List of candidates
const candidates: Candidate[] = [
  {
    id: "cand-1",
    name: "Nguyễn Minh Anh",
    role: "Chủ tịch Hội Sinh viên",
    class: "K28 - Khoa Khoa học Máy tính",
    slogan: "Sáng tạo và Kết nối tuổi trẻ",
    description: "Ủy viên BCH Đoàn trường, chủ nhiệm CLB Lập trình. Cam kết thúc đẩy chuyển đổi số học đường, tổ chức các hội thảo công nghệ và giới thiệu việc làm bán thời gian cho sinh viên.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "cand-2",
    name: "Trần Thị Thanh Vy",
    role: "Chủ tịch Hội Sinh viên",
    class: "K28 - Khoa Quản trị Kinh doanh",
    slogan: "Đồng hành và Phát triển tài năng trẻ",
    description: "Phó chủ tịch CLB Khởi nghiệp sinh viên. Đề xuất phát triển quỹ học bổng khởi nghiệp, liên kết quốc tế, nâng cao kỹ năng đàm phán mài giũa tài năng mềm toàn diện.",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "cand-3",
    name: "Phạm Hoàng Long",
    role: "Chủ tịch Hội Sinh viên",
    class: "K28 - Khoa Công nghệ Sinh học",
    slogan: "Môi trường học tập xanh, năng lượng tích cực",
    description: "Đội phó Đội Sinh viên Tình nguyện Mùa hè xanh. Mong muốn cải tiến không gian tự học ngoài trời, thúc đẩy đại hội thể thao điện tử học sinh sinh viên chất lượng.",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "cand-4",
    name: "Lê Thảo My",
    role: "Chủ tịch Hội Sinh viên",
    class: "K28 - Khoa Ngoại ngữ & Truyền thông",
    slogan: "Bảo vệ quyền lợi, lắng nghe tiếng nói chung",
    description: "Đại diện Hội hỗ trợ tâm lý học thuật trường học. Hướng đến tối ưu hóa quy trình xin cấp giấy tờ hành chính dạng số hóa và gia tăng sự đa dạng các ngày hội giao lưu văn hóa quốc tế.",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  }
];

// Memory blockchain ledger
let blockchain: Block[] = [];

// Helper functions for Cryptographic Blockchain Hash
function calculateHash(
  index: number,
  timestamp: number,
  votes: Vote[],
  previousHash: string,
  nonce: number
): string {
  const data = index + timestamp + JSON.stringify(votes) + previousHash + nonce;
  return crypto.createHash("sha256").update(data).digest("hex");
}

// Check blockchain system integrity
function validateChain(chain: Block[]): BlockchainStatus {
  const corruptedBlockIndices: number[] = [];
  let isValid = true;
  let message = "Mạch Blockchain Hoàn Hảo (Hợp lệ)";

  for (let i = 1; i < chain.length; i++) {
    const currentBlock = chain[i];
    const previousBlock = chain[i - 1];

    // Recompute the block's hash based on its values
    const recomputedHash = calculateHash(
      currentBlock.index,
      currentBlock.timestamp,
      currentBlock.votes,
      currentBlock.previousHash,
      currentBlock.nonce
    );

    let isThisBlockCorrupted = false;

    // 1. Hash mismatch check
    if (currentBlock.hash !== recomputedHash) {
      isThisBlockCorrupted = true;
    }

    // 2. Link mismatch check
    if (currentBlock.previousHash !== previousBlock.hash) {
      isThisBlockCorrupted = true;
    }

    if (isThisBlockCorrupted) {
      isValid = false;
      corruptedBlockIndices.push(currentBlock.index);
    }
  }

  if (!isValid) {
    message = `Hệ thống phát hiện sửa đổi bất hợp pháp tại các khối: Block #${corruptedBlockIndices.join(", #")}`;
  }

  return {
    isValid,
    tamperedBlockIndex: corruptedBlockIndices.length > 0 ? corruptedBlockIndices[0] : null,
    message,
    corruptedBlockIndices
  };
}

// Reset/Initialize blockchain with Genesis & Verified Seed Blocks
function initializeBlockchain() {
  blockchain = [];
  
  // Genesis Block
  const genesisTimestamp = Date.parse("2026-06-05T08:00:00Z");
  const genesisHash = crypto.createHash("sha256").update("0" + genesisTimestamp + "[]" + "0" + "0").digest("hex");
  const genesisBlock: Block = {
    index: 0,
    timestamp: genesisTimestamp,
    votes: [],
    previousHash: "0",
    hash: genesisHash,
    nonce: 0
  };
  blockchain.push(genesisBlock);

  // 4 Seed Votes
  const seedVotes = [
    { name: "Phạm Minh Đức", sid: "SV26001", cid: "cand-1", cname: "Nguyễn Minh Anh" },
    { name: "Lê Thu Hương", sid: "SV26002", cid: "cand-2", cname: "Trần Thị Thanh Vy" },
    { name: "Nguyễn Hoàng Nam", sid: "SV26003", cid: "cand-1", cname: "Nguyễn Minh Anh" },
    { name: "Đỗ Bảo Trâm", sid: "SV26004", cid: "cand-3", cname: "Phạm Hoàng Long" }
  ];

  for (const sv of seedVotes) {
    const prevBlock = blockchain[blockchain.length - 1];
    const timestamp = genesisTimestamp + blockchain.length * 3600000; // custom spacing hour
    
    // Create signature
    const signatureInput = `${sv.name}-${sv.sid}-${sv.cid}-${timestamp}`;
    const signature = crypto.createHash("sha256").update(signatureInput).digest("hex").substring(0, 16);

    const vote: Vote = {
      voterName: sv.name,
      studentId: sv.sid,
      candidateId: sv.cid,
      candidateName: sv.cname,
      timestamp,
      signature
    };

    // Mine block (Nonce Proof of Work with difficulty "0")
    const index = blockchain.length;
    let nonce = 0;
    let hash = "";
    const difficulty = "0";
    while (true) {
      hash = calculateHash(index, timestamp, [vote], prevBlock.hash, nonce);
      if (hash.startsWith(difficulty)) {
        break;
      }
      nonce++;
    }

    blockchain.push({
      index,
      timestamp,
      votes: [vote],
      previousHash: prevBlock.hash,
      hash,
      nonce
    });
  }
}

// Initial system boots up
initializeBlockchain();

// === ENDPOINTS ===

// Get Candidates
app.get("/api/candidates", (req, res) => {
  res.json(candidates);
});

// Get Blockchain Details together with validation result
app.get("/api/blockchain", (req, res) => {
  const audit = validateChain(blockchain);
  res.json({
    chain: blockchain,
    audit
  });
});

// Post Login Check
app.post("/api/login", (req, res) => {
  const { name, studentId } = req.body;
  if (!name || !studentId) {
    return res.status(400).json({ error: "Vui lòng nhập tên và mã số sinh viên!" });
  }

  // Format ID to clean upper-case
  const cleanId = studentId.trim().toUpperCase();
  const cleanName = name.trim();

  // Check inblockchain to see if they voted
  let hasVoted = false;
  for (const block of blockchain) {
    for (const vote of block.votes) {
      if (vote.studentId === cleanId) {
        hasVoted = true;
        break;
      }
    }
  }

  return res.json({
    success: true,
    user: {
      name: cleanName,
      studentId: cleanId,
      hasVoted
    }
  });
});

// Cast Vote (requires voter name, student ID, candidate ID)
app.post("/api/vote", (req, res) => {
  const { voterName, studentId, candidateId } = req.body;

  if (!voterName || !studentId || !candidateId) {
    return res.status(400).json({ error: "Thông tin bỏ phiếu không đầy đủ!" });
  }

  const cleanId = studentId.trim().toUpperCase();
  const cleanName = voterName.trim();

  // 1. Verify if they've voted already by scanning blockchain blocks
  let hasVoted = false;
  for (const block of blockchain) {
    for (const vote of block.votes) {
      if (vote.studentId === cleanId) {
        hasVoted = true;
        break;
      }
    }
  }

  if (hasVoted) {
    return res.status(400).json({ error: "Mã số sinh viên này đã hoàn thành bỏ phiếu trước đó!" });
  }

  // 2. Find target candidate
  const candidate = candidates.find((c) => c.id === candidateId);
  if (!candidate) {
    return res.status(404).json({ error: "Ứng cử viên không tồn tại!" });
  }

  // 3. Assemble Vote Transaction
  const timestamp = Date.now();
  const signatureInput = `${cleanName}-${cleanId}-${candidateId}-${timestamp}`;
  const signature = crypto.createHash("sha256").update(signatureInput).digest("hex").substring(0, 16);

  const vote: Vote = {
    voterName: cleanName,
    studentId: cleanId,
    candidateId,
    candidateName: candidate.name,
    timestamp,
    signature
  };

  // 4. Create block and solve light cryptographical work (Proof of Work difficulty: "00")
  const index = blockchain.length;
  const prevBlock = blockchain[index - 1];
  const previousHash = prevBlock ? prevBlock.hash : "0";

  let nonce = 0;
  let hash = "";
  const difficulty = "00"; // Slight difficulty for a nice realistic visual loading miner on UI!
  const startTime = Date.now();
  
  while (true) {
    hash = calculateHash(index, timestamp, [vote], previousHash, nonce);
    if (hash.startsWith(difficulty)) {
      break;
    }
    nonce++;
  }

  const durationMs = Date.now() - startTime;

  const newBlock: Block = {
    index,
    timestamp,
    votes: [vote],
    previousHash,
    hash,
    nonce
  };

  // Push new block to our chain
  blockchain.push(newBlock);

  // Return minted result
  res.json({
    success: true,
    block: newBlock,
    durationMs,
    audit: validateChain(blockchain)
  });
});

// SIMULATION: Simulating malicious hacker tampering directly with block parameters
app.post("/api/tamper", (req, res) => {
  const { index, candidateId } = req.body;

  const targetIndex = parseInt(index, 10);
  if (isNaN(targetIndex) || targetIndex <= 0 || targetIndex >= blockchain.length) {
    return res.status(400).json({ error: "Vị trí khối không hợp lệ!" });
  }

  const candidate = candidates.find((c) => c.id === candidateId);
  if (!candidate) {
    return res.status(404).json({ error: "Ứng cử viên mới không tồn tại!" });
  }

  // Malicious update of the block details
  // Note: We bypass normal blockchain hashing constraint explicitly to model the attack!
  const block = blockchain[targetIndex];
  if (block.votes && block.votes.length > 0) {
    const originalVote = block.votes[0];
    
    // We swap the candidate inside the vote array without re-signing or mining properly!
    block.votes[0] = {
      ...originalVote,
      candidateId: candidate.id,
      candidateName: candidate.name
    };
    
    // We do NOT update block.hash, simulating how someone hacking a SQL row or JSON document changes the record,
    // leaving block's old hash inconsistent, or if they do recompute block hash, it breaks the linked chain
    // previousHash of subsequent index blocks! Let's let them tamper directly.
    return res.json({
      success: true,
      message: `Đã can thiệp dữ liệu khối #${targetIndex}! Hãy cập nhật chuỗi và thực hiện đối soát tính toàn vẹn.`,
      block: block,
      audit: validateChain(blockchain)
    });
  } else {
    return res.status(400).json({ error: "Khối không chứa phiếu bầu hợp lệ." });
  }
});

// Reset Blockchain back to seed state
app.post("/api/reset", (req, res) => {
  initializeBlockchain();
  res.json({
    success: true,
    message: "Hệ thống Blockchain đã được khôi phục về trạng thái nguyên bản thành công!",
    chain: blockchain,
    audit: validateChain(blockchain)
  });
});

// Serve frontend SPA or configure dev server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
