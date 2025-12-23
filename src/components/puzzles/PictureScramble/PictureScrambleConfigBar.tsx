import type { PictureScrambleConfig } from './index';
import styles from './PictureScrambleConfigBar.module.css';

interface ConfigBarProps {
  value: PictureScrambleConfig;
  onChange: (config: PictureScrambleConfig) => void;
}

export default function PictureScrambleConfigBar({ value, onChange }: ConfigBarProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Convert to data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      onChange({ imageUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    onChange({ imageUrl: undefined });
  };

  return (
    <div className={styles.configBar}>
      <label className={styles.uploadButton}>
        {value.imageUrl ? '📷 Change Image' : '📷 Upload Image'}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
      </label>
      {value.imageUrl && (
        <button
          className={styles.clearButton}
          onClick={handleClearImage}
          title="Clear image"
        >
          ✕
        </button>
      )}
    </div>
  );
}
