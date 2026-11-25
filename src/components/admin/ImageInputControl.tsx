import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { SiteAssetSlot } from '../../services/siteSettingsService';
import { isValidImageUrlSyntax, validateSiteAssetFile } from '../../utils/storeLogic';

export type ImageInputMode = 'upload' | 'url';

interface ImageInputControlProps {
  label: string;
  value: string;
  onChange: (nextUrl: string) => void;
  onValidityChange?: (isValid: boolean, errorMessage?: string) => void;
  uploadFolder: SiteAssetSlot;
  allowSvg?: boolean;
  defaultUrl?: string;
  defaultButtonLabel?: string;
  previewClassName?: string;
  previewImageClassName?: string;
  previewAlt?: string;
  helperText?: string;
  inputIdPrefix: string;
  compact?: boolean;
  allowClear?: boolean;
}

export const ImageInputControl: React.FC<ImageInputControlProps> = ({
  label,
  value,
  onChange,
  onValidityChange,
  uploadFolder,
  allowSvg = false,
  defaultUrl,
  defaultButtonLabel = 'Use Default',
  previewClassName = 'w-20 h-20 rounded-xl bg-white border border-outline-variant p-1.5 flex items-center justify-center shrink-0 overflow-hidden',
  previewImageClassName = 'w-full h-full object-contain',
  previewAlt,
  helperText,
  inputIdPrefix,
  compact = false,
  allowClear = false,
}) => {
  const { uploadSiteAsset } = useStore();
  const [mode, setMode] = useState<ImageInputMode>('upload');
  const [urlInput, setUrlInput] = useState<string>(() =>
    value && !value.startsWith('data:') ? value : ''
  );
  const [uploading, setUploading] = useState(false);
  const [checkingUrl, setCheckingUrl] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const checkSeqRef = useRef(0);

  useEffect(() => {
    setPreviewFailed(false);
    if (value && !value.startsWith('data:') && mode === 'upload') {
      setUrlInput(value);
    }
  }, [value, mode]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const notifyValid = (valid: boolean, err?: string) => {
    onValidityChange?.(valid, err);
  };

  const handleModeSwitch = (nextMode: ImageInputMode) => {
    setMode(nextMode);
    setErrorMsg(null);
    setStatusMsg(null);
    if (nextMode === 'url') {
      const initial = value && !value.startsWith('data:') ? value : '';
      setUrlInput(initial);
      notifyValid(true);
    } else {
      notifyValid(true);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setErrorMsg(null);
    setStatusMsg(null);

    const validationError = validateSiteAssetFile(
      { name: file.name, type: file.type, size: file.size },
      { allowSvg }
    );
    if (validationError) {
      setErrorMsg(validationError);
      notifyValid(false, validationError);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl(objectUrl);
    setPreviewFailed(false);
    setUploading(true);

    try {
      const publicUrl = await uploadSiteAsset(file, uploadFolder);
      onChange(publicUrl);
      if (!publicUrl.startsWith('data:')) {
        setUrlInput(publicUrl);
      }
      setLocalPreviewUrl(null);
      URL.revokeObjectURL(objectUrl);
      setStatusMsg(`Uploaded ${file.name}`);
      notifyValid(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Image upload failed.';
      setLocalPreviewUrl(null);
      URL.revokeObjectURL(objectUrl);
      setErrorMsg(msg);
      notifyValid(false, msg);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (raw: string) => {
    setUrlInput(raw);
    setStatusMsg(null);
    const trimmed = raw.trim();

    if (!trimmed) {
      if (allowClear) {
        setErrorMsg(null);
        setCheckingUrl(false);
        onChange('');
        notifyValid(true);
      } else {
        setErrorMsg(null);
        setCheckingUrl(false);
        notifyValid(true);
      }
      return;
    }

    if (!isValidImageUrlSyntax(trimmed, { allowSvg })) {
      setCheckingUrl(false);
      setErrorMsg('Invalid image link');
      notifyValid(false, 'Invalid image link');
      return;
    }

    const seq = ++checkSeqRef.current;
    setCheckingUrl(true);
    setErrorMsg(null);
    notifyValid(false, 'Checking image link...');

    const probe = new Image();
    probe.referrerPolicy = 'no-referrer';
    probe.onload = () => {
      if (checkSeqRef.current !== seq) return;
      setCheckingUrl(false);
      setErrorMsg(null);
      setPreviewFailed(false);
      onChange(trimmed);
      setStatusMsg('Image link verified');
      notifyValid(true);
    };
    probe.onerror = () => {
      if (checkSeqRef.current !== seq) return;
      setCheckingUrl(false);
      setErrorMsg('Invalid image link');
      notifyValid(false, 'Invalid image link');
    };
    probe.src = trimmed;
  };

  const activePreviewSrc = localPreviewUrl
    ? localPreviewUrl
    : mode === 'url'
    ? errorMsg
      ? ''
      : urlInput.trim() || value
    : value;
  const acceptAttr = allowSvg
    ? '.jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml'
    : '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';
  const formatHint = allowSvg ? 'JPG, PNG, WEBP, SVG · Max 2 MB' : 'JPG, PNG, WEBP · Max 2 MB';

  return (
    <div className={`rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-3 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-on-surface">{label}</span>
        <div className="flex items-center gap-2">
          {allowClear && value && (
            <button
              type="button"
              onClick={() => {
                setUrlInput('');
                setErrorMsg(null);
                setStatusMsg(null);
                onChange('');
                notifyValid(true);
              }}
              className="text-[11px] font-semibold text-on-surface-variant hover:text-error"
            >
              Clear
            </button>
          )}
          {defaultUrl && (
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setStatusMsg(null);
                setPreviewFailed(false);
                setUrlInput(defaultUrl);
                onChange(defaultUrl);
                notifyValid(true);
              }}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              {defaultButtonLabel}
            </button>
          )}
        </div>
      </div>

      {/* Mode Switcher Tabs: Upload Image / Image URL */}
      <div
        role="tablist"
        aria-label={`${label} input mode`}
        className="inline-flex rounded-lg bg-surface-container p-0.5 self-start border border-surface-container-high"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'upload'}
          onClick={() => handleModeSwitch('upload')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
            mode === 'upload'
              ? 'bg-surface-container-lowest text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Upload Image
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'url'}
          onClick={() => handleModeSwitch('url')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
            mode === 'url'
              ? 'bg-surface-container-lowest text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Image URL
        </button>
      </div>

      <div className={compact ? 'flex items-center gap-3' : 'flex flex-col sm:flex-row sm:items-center gap-4'}>
        <div className={previewClassName}>
          {activePreviewSrc && !previewFailed ? (
            <img
              src={activePreviewSrc}
              alt={previewAlt || `${label} preview`}
              referrerPolicy="no-referrer"
              onError={() => setPreviewFailed(true)}
              className={previewImageClassName}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/60">
              <span aria-hidden="true" className="material-symbols-outlined text-[22px]">
                image
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          {mode === 'upload' ? (
            <>
              <label
                htmlFor={`${inputIdPrefix}-file`}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-xs font-semibold text-on-surface cursor-pointer"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-primary">
                  upload
                </span>
                <span>{uploading ? 'Uploading...' : `Choose ${label}`}</span>
              </label>
              <input
                id={`${inputIdPrefix}-file`}
                type="file"
                accept={acceptAttr}
                disabled={uploading}
                onChange={(e) => void handleFileChange(e)}
                className="sr-only"
              />
              <span className="text-[11px] text-on-surface-variant font-spec-code">
                {formatHint}
              </span>
            </>
          ) : (
            <>
              <label htmlFor={`${inputIdPrefix}-url`} className="sr-only">
                {label} URL
              </label>
              <input
                id={`${inputIdPrefix}-url`}
                type="url"
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className={`w-full rounded-lg border px-3 py-2 text-xs font-spec-code bg-surface-container-lowest focus:outline-none focus:ring-2 ${
                  errorMsg
                    ? 'border-error focus:ring-error/30'
                    : 'border-outline-variant focus:ring-primary'
                }`}
              />
              <span className="text-[11px] text-on-surface-variant">
                {checkingUrl
                  ? 'Checking image link...'
                  : 'Paste an HTTPS image link. Live preview verifies before saving.'}
              </span>
            </>
          )}

          {helperText && !errorMsg && !statusMsg && (
            <span className="text-[11px] text-on-surface-variant">{helperText}</span>
          )}
          {errorMsg && (
            <span role="alert" className="text-[11px] font-semibold text-error">
              {errorMsg}
            </span>
          )}
          {statusMsg && !errorMsg && (
            <span className="text-[11px] font-semibold text-tertiary">{statusMsg}</span>
          )}
        </div>
      </div>
    </div>
  );
};
