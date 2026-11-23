'use client';

import { ImagePlus, LoaderCircle, RotateCcw } from 'lucide-react';
import type * as React from 'react';
import { useId, useRef, useState } from 'react';
import { cn } from '../lib/utils';

type PhotoUploaderState = 'idle' | 'uploading' | 'error';

interface PhotoUploaderProps extends Omit<React.ComponentProps<'div'>, 'onSelect'> {
  /** URL of the photo already pinned to the profile (the preview). */
  readonly previewUrl?: string | null;
  /** Name of the file shown next to the preview. */
  readonly fileName?: string | null;
  /** The mentor picks a file — the app uploads it with a presigned URL (requirement 2). */
  readonly onSelect: (file: File) => void;
  readonly state?: PhotoUploaderState;
  /** Message under the field: why the file was refused or what is wrong with the upload. */
  readonly error?: string | null;
  /** Accepted types, e.g. "image/jpeg,image/png". */
  readonly accept?: string;
  /** Name of the button that opens the file picker. */
  readonly chooseLabel: string;
  /** Name of the button that repeats a failed upload. */
  readonly retryLabel: string;
  /** Description of the file picker for screen readers. */
  readonly description?: string;
}

/**
 * Profile photo of the mentor (requirement 2): the browser sends the file straight to the
 * storage, so the component only picks the file, shows the preview and the state of the upload.
 * The rules (type, size, dimensions) are checked by the server — the field only says what is
 * allowed, so the mentor knows before the upload starts.
 */
function PhotoUploader({
  previewUrl = null,
  fileName = null,
  onSelect,
  state = 'idle',
  error = null,
  accept = 'image/jpeg,image/png',
  chooseLabel,
  retryLabel,
  description,
  className,
  ...props
}: PhotoUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const showPreview = localPreview ?? previewUrl;

  const pick = (file: File | undefined) => {
    if (file === undefined) return;
    if (localPreview !== null) URL.revokeObjectURL(localPreview);
    setLocalPreview(URL.createObjectURL(file));
    onSelect(file);
  };

  return (
    <div data-slot="photo-uploader" className={cn('flex flex-col gap-inline', className)} {...props}>
      <div className="flex items-center gap-panel">
        <span
          data-slot="photo-uploader-preview"
          className="flex size-avatar-lg shrink-0 items-center justify-center overflow-hidden rounded-round border border-border-divider bg-surface-sunken"
        >
          {showPreview === null ? (
            <ImagePlus aria-hidden="true" className="size-icon-md text-text-muted" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- the photo comes from the storage as is; Next would need a loader for a signed URL
            <img
              src={showPreview}
              alt=""
              className="size-full object-cover"
              data-testid="photo-uploader-preview-image"
            />
          )}
        </span>
        <div className="flex min-w-0 flex-col gap-tight">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={accept}
            className="sr-only"
            aria-describedby={description === undefined ? undefined : `${inputId}-description`}
            onChange={(event) => {
              pick(event.target.files?.[0]);
            }}
          />
          <div className="flex flex-wrap items-center gap-inline">
            <label
              htmlFor={inputId}
              className="inline-flex h-control cursor-pointer items-center justify-center gap-inline rounded-control border border-border-control bg-surface-panel px-button-x text-label font-medium text-text-default hover:bg-surface-hover"
            >
              {chooseLabel}
            </label>
            {state === 'error' && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex h-control items-center justify-center gap-inline rounded-control px-button-x text-label font-medium text-text-default hover:bg-surface-hover"
              >
                <RotateCcw aria-hidden="true" className="size-icon-sm" />
                {retryLabel}
              </button>
            )}
            {state === 'uploading' && (
              <span
                role="status"
                className="inline-flex items-center gap-inline text-body-dense text-text-muted"
              >
                <LoaderCircle aria-hidden="true" className="size-icon-sm" />
                {description}
              </span>
            )}
          </div>
          {fileName !== null && state !== 'uploading' && (
            <p data-slot="photo-uploader-file" className="truncate text-body-dense text-text-muted">
              {fileName}
            </p>
          )}
          {description !== undefined && state !== 'uploading' && (
            <p id={`${inputId}-description`} className="text-body-dense text-text-muted">
              {description}
            </p>
          )}
        </div>
      </div>
      {error !== null && (
        <p role="alert" data-slot="photo-uploader-error" className="text-body-dense text-status-danger-fg">
          {error}
        </p>
      )}
    </div>
  );
}

export { PhotoUploader, type PhotoUploaderProps };
