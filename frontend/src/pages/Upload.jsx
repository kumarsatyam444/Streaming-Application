/**
 * Upload Page
 * Handles video file uploads with progress tracking
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../api/videos.js';
import styles from '../styles/Upload.module.css';

export const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['video/mp4', 'video/x-matroska', 'video/webm'];
      const validExtensions = ['.mp4', '.mkv', '.webm'];

      const fileName = selectedFile.name.toLowerCase();
      const isValidType =
        validTypes.includes(selectedFile.type) ||
        validExtensions.some((ext) => fileName.endsWith(ext));

      if (!isValidType) {
        setError('Only mp4, mkv, and webm files are allowed');
        return;
      }

      if (selectedFile.size > 500000000) {
        // 500MB
        setError('File size exceeds 500MB limit');
        return;
      }

      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    console.log('Starting upload:', file.name, 'Size:', file.size, 'Type:', file.type);

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('description', description);
      formData.append('tags', tags);

      console.log('FormData created, sending to server...');

      const response = await videoAPI.upload(formData, (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded / progressEvent.total) * 100
        );
        console.log('Upload progress:', progress + '%');
        setUploadProgress(progress);
      });

      console.log('Upload response:', response.data);

      setSuccess('Video uploaded successfully! Processing will start shortly.');
      setFile(null);
      setDescription('');
      setTags('');
      setUploadProgress(0);

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Upload failed';
      console.error('Upload error:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
      });
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFiles = e.dataTransfer?.files;
    if (droppedFiles?.[0]) {
      const event = {
        target: {
          files: droppedFiles,
        },
      };
      handleFileChange(event);
    }
  };

  const handleFileInputClick = () => {
    console.log('File input click triggered');
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Upload Video</h1>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div
            className={styles.dropZone}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleFileInputClick}
          >
            <div className={styles.dropZoneContent}>
              <div className={styles.icon}>📹</div>
              <p className={styles.text}>
                Drag and drop your video here, or click to select
              </p>
              <p className={styles.subtext}>Supported: MP4, MKV, WebM (Max 500MB)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,.mp4,video/x-matroska,.mkv,video/webm,.webm"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {!file && (
            <button
              type="button"
              onClick={handleFileInputClick}
              className={styles.selectFileBtn}
            >
              Select Video File
            </button>
          )}

          {file && (
            <div className={styles.fileSelected}>
              <div className={styles.fileName}>📄 {file.name}</div>
              <div className={styles.fileSize}>
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className={styles.removeBtn}
              >
                Remove
              </button>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your video..."
              maxLength="1000"
              rows="4"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="tags">Tags (Optional)</label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          {uploading && (
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className={styles.progressText}>{uploadProgress}%</div>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className={styles.submitBtn}
          >
            {uploading ? `Uploading ${uploadProgress}%` : 'Upload Video'}
          </button>
        </form>
      </div>
    </div>
  );
};
