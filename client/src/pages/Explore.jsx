import React, { useState } from "react";
import "../styles/ResumeScreening.css";

const ResumeScreening = () => {
  const [jobDesc, setJobDesc] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!resumeFile || !jobDesc) {
      alert("Please upload a resume and enter job description.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jobDesc", jobDesc);

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/resume/screen", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload or process resume.");
      }

      const data = await response.json();
      setScore(data.matchScore);
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong while screening the resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-screening">
      <h2>Resume Screening</h2>
      <form onSubmit={handleUpload}>
        <textarea
          rows="5"
          placeholder="Paste job description here..."
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
          required
        ></textarea>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setResumeFile(e.target.files[0])}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Screening..." : "Submit"}
        </button>
      </form>
      {score !== null && (
        <div className="score">
          <h3>Match Score: {score}%</h3>
          {score > 70 ? "✅ Good Match!" : "⚠️ Try improving keywords in your resume."}
        </div>
      )}
    </div>
  );
};

export default ResumeScreening;
