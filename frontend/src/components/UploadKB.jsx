import { useState, useRef } from "react";
import { uploadFile } from "../api";
import { IconFile, IconWarning, IconCheck, IconUploadArrow } from "./Icons";

export default function UploadKB() {
  const [file, setFile] = useState(null);
  const [companyId, setCompanyId] = useState("default");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  };

  const validateAndSet = (f) => {
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["pdf", "txt"].includes(ext)) {
      setError("Only .pdf and .txt files are supported.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB.");
      return;
    }
    setFile(f);
    setError("");
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file || !companyId.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await uploadFile(file, companyId.trim());
      setResult(res);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const canUpload = file && companyId.trim() && !loading;

  return (
    <div className="page-body" style={{ maxWidth: 600 }}>
      <div className="card">
        <div className="card-header">Upload Knowledge Base Document</div>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Drop zone */}
          <div
            className={`upload-zone${dragging ? " dragging" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files[0]) validateAndSet(e.target.files[0]);
              }}
            />
            <div className="upload-icon"><IconFile size={32} /></div>
            {file ? (
              <>
                <div className="upload-label" style={{ color: "var(--primary)" }}>
                  {file.name}
                </div>
                <div className="upload-hint">
                  {(file.size / 1024).toFixed(1)} KB · Click to change
                </div>
              </>
            ) : (
              <>
                <div className="upload-label">Drop a file or click to browse</div>
                <div className="upload-hint">Supports .pdf and .txt · Max 10MB</div>
              </>
            )}
          </div>

          {/* Company ID */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Company ID</label>
            <input
              className="form-input"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              placeholder="default"
            />
            <div className="form-hint">
              The document will be stored in this company's knowledge base.
            </div>
          </div>

          {/* Feedback */}
          {error && (
            <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconWarning size={15} /> {error}
            </div>
          )}
          {result && (
            <div className="alert alert-success" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconCheck size={14} /> Indexed <strong>{result.chunks_ingested}</strong> chunks from{" "}
              <strong>{result.filename}</strong> into company{" "}
              <strong>{result.company_id}</strong>.
            </div>
          )}

          {/* Upload button */}
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!canUpload}
            style={{ alignSelf: "flex-start" }}
          >
            {loading ? (
              <><span className="spinner" /> Uploading…</>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <IconUploadArrow size={15} /> Upload & Index
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Info box */}
      <div
        className="card"
        style={{ marginTop: 16, padding: "14px 18px" }}
      >
        <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>
          <strong style={{ color: "var(--text)" }}>How it works</strong>
          <ol style={{ marginTop: 8, paddingLeft: 18 }}>
            <li>Your document is split into 500-character chunks with 50-char overlap.</li>
            <li>Each chunk is embedded using <code className="mono">all-MiniLM-L6-v2</code> locally.</li>
            <li>Embeddings are stored in ChromaDB under your company ID.</li>
            <li>When a customer asks a question, the top 4 relevant chunks are retrieved and sent to the LLM as context.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
