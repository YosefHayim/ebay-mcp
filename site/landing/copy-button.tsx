import { CheckIcon } from '@site/landing/check-icon.tsx';

interface CopyButtonProps {
  label: string;
  copyTarget: string;
}

export const CopyButton = ({ label, copyTarget }: CopyButtonProps) => (
  <button class="copybtn" type="button" data-copy-target={copyTarget} aria-label={label}>
    <span class="on-copy">
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15V5a2 2 0 0 1 2-2h8" />
      </svg>
      Copy
    </span>
    <span class="on-copied">
      <CheckIcon size={13} color="#5fd39a" />
      Copied
    </span>
  </button>
);
