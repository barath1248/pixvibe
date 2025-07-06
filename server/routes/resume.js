import express from "express";
import multer from "multer";
import fs from "fs";
import pdfParse from "pdf-parse";
import natural from "natural";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Function to calculate keyword match score
function calculateScore(jobDesc, resumeText) {
  const tokenizer = new natural.WordTokenizer();
  const jobWords = tokenizer.tokenize(jobDesc.toLowerCase());
  const resumeWords = tokenizer.tokenize(resumeText.toLowerCase());

  const matchWords = jobWords.filter(word => resumeWords.includes(word));
  const score = (matchWords.length / jobWords.length) * 100;

  return Math.round(score);
}

// Route to handle resume screening
router.post("/screen", upload.single("resume"), async (req, res) => {
  try {
    const jobDesc = req.body.jobDesc;

    if (!req.file || !jobDesc) {
      return res.status(400).json({ error: "Missing file or job description." });
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(fileBuffer);
    const resumeText = parsed.text;

    // Clean up uploaded file
    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete file:", err);
    });

    const score = calculateScore(jobDesc, resumeText);
    res.json({ matchScore: score });
  } catch (error) {
    console.error("Resume parsing failed:", error.message);
    res.status(500).json({ error: "Resume parsing failed." });
  }
});

export default router;
