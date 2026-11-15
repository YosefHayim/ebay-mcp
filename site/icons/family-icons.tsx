import { renderFamilyIconSvg } from '@site/icons/family-icon-markup.ts';

interface FamilyIconProps {
  familyKey: string;
  size?: number;
}

/** The line icon of one tool family, drawn inline so it takes the text color. */
export const FamilyIcon = ({ familyKey, size = 18 }: FamilyIconProps) => (
  <span
    class="family-icon"
    dangerouslySetInnerHTML={{ __html: renderFamilyIconSvg(familyKey, size) }}
  />
);
