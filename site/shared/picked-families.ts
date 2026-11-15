import type { ToolCatalog } from '../../scripts/buildToolCatalog.ts';

export interface PickedFamilies {
  orderedKeys: string[];
  toolTotal: number;
}

/** The picked families in catalog order, and how many tools they load together. */
export const createPickedFamilies = (
  catalog: ToolCatalog,
  pickedFamilyKeys: string[],
): PickedFamilies => {
  const pickedFamilies = catalog.families.filter((family) => pickedFamilyKeys.includes(family.key));

  return {
    orderedKeys: pickedFamilies.map((family) => family.key),
    toolTotal: pickedFamilies.reduce((total, family) => total + family.toolCount, 0),
  };
};
