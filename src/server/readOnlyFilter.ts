import process from "node:process";
export interface ReadOnlyToolDefinition {
	name: string;
	annotations?: {
		readOnlyHint?: boolean;
		destructiveHint?: boolean;
	};
}

const WRITE_NAME_PATTERN =
	/(^|_)(create|update|delete|issue|publish|end|revise|upload|accept|contest|send|mark|provide|appeal|escalate|close|add|remove|set|relish|withdraw|complete|confirm|cancel|void|replace|move|enable|disable|assign|unassign|transfer|relinquish|relist|promote|pause|resume|launch|clone)(_|$)/;

const READ_NAME_PATTERN =
	/(^|_)(get|list|find|search|fetch|check|read|view|describe|status|health)(_|$)/;

export function isReadOnlyTool(definition: ReadOnlyToolDefinition): boolean {
	if (definition.annotations?.readOnlyHint == true) return true;
	if (definition.annotations?.readOnlyHint == false) return false;
	if (definition.annotations?.destructiveHint == true) return false;

	const name = definition.name.toLowerCase();

	if (WRITE_NAME_PATTERN.test(name)) return false;
	if (READ_NAME_PATTERN.test(name)) return true;
	// Connector tools without the ebay_ prefix
	if (name == "search" || name == "fetch") return true;

	// Default: exclude from read-only mode (safer)
	return false;
}

export function isReadOnlyModeEnabled(
	env: NodeJS.ProcessEnv = process.env,
): boolean {
	const raw = env["EBAY_READ_ONLY"]?.trim().toLowerCase();
	return raw == "true" || raw == "1" || raw == "yes";
}
