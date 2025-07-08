import React, { useState } from "react";
import styles from "../styles/ResumeScreening.module.css";

const ResumeScreening = () => {
  const [jobDesc, setJobDesc] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!resumeFile || !jobDesc) {
      setError("Please upload a resume and enter job description.");
      return;
    }

    setLoading(true);
    setError("");
    setScore(null);

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jobDesc", jobDesc);

    try {
      const BASE_URL = 'https://pixvibe.onrender.com';
      const response = await fetch(`${BASE_URL}/api/resume/screen`, {
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
      setError("Something went wrong while screening the resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Resume Screening</h2>
      <form className={styles.form} onSubmit={handleUpload}>
        <label className={styles.label}>Job Description</label>
        <textarea
          className={styles.textarea}
          rows="6"
          placeholder="Paste job description here..."
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
        />

        <label className={styles.label}>Upload Resume (.pdf)</label>
        <input
          className={styles.fileInput}
          type="file"
          accept=".pdf"
          onChange={(e) => setResumeFile(e.target.files[0])}
        />

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {score !== null && (
        <div className={styles.result}>
          <h3>Match Score: {score}%</h3>
          {score >= 70 ? (
            <p className={styles.good}>✅ Good Match!</p>
          ) : (
            <p className={styles.bad}>⚠️ Try improving your keywords.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeScreening;
