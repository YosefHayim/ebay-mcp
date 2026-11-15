const COMPONENTS_DECLARATION = /\binterface components\b/g;
const COMPONENTS_REFERENCE = /\bcomponents\[/g;
const OPERATIONS_DECLARATION = /\binterface operations\b/g;
const OPERATIONS_REFERENCE = /\boperations\[/g;

export interface NamespaceNames {
  readonly components: string;
  readonly operations: string;
}

export const generatedNamespaceNames: Readonly<Record<string, NamespaceNames>> = {
  developerAnalyticsV1BetaOas3: {
    components: 'DeveloperAnalyticsComponents',
    operations: 'DeveloperAnalyticsOperations',
  },
  developerClientRegistrationV1Oas3: {
    components: 'DeveloperClientRegistrationComponents',
    operations: 'DeveloperClientRegistrationOperations',
  },
  developerKeyManagementV1Oas3: {
    components: 'DeveloperKeyManagementComponents',
    operations: 'DeveloperKeyManagementOperations',
  },
};

export const renameGeneratedNamespaces = (generatedTypes: string, names: NamespaceNames): string =>
  generatedTypes
    .replace(COMPONENTS_DECLARATION, `interface ${names.components}`)
    .replace(COMPONENTS_REFERENCE, `${names.components}[`)
    .replace(OPERATIONS_DECLARATION, `interface ${names.operations}`)
    .replace(OPERATIONS_REFERENCE, `${names.operations}[`);
