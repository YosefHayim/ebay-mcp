import type { CardBadge } from "@/tool-registry/ui/viewModels.js";

interface MoneyLike {
	value?: string;
	currency?: string;
}

export function formatAmount(amount: MoneyLike | undefined): string | null {
	if (amount?.value == null) {
		return null;
	}
	return amount.currency ? `${amount.value} ${amount.currency}` : amount.value;
}

export function humanizeStatus(status: string | undefined): string | null {
	if (!status) {
		return null;
	}
	const lowered = status.toLowerCase().replace(/_/g, " ");
	return lowered.charAt(0).toUpperCase() + lowered.slice(1);
}

export function statusTone(status: string | undefined): CardBadge["tone"] {
	if (!status) {
		return "neutral";
	}
	const upper = status.toUpperCase();
	if (
		/FAIL|CANCEL|UNPAID|DECLINE|SUSPEND|OUT_OF_STOCK|BELOW_STANDARD|DISABLED/.test(
			upper,
		)
	) {
		return "danger";
	}
	if (
		/PENDING|IN_PROGRESS|NOT_STARTED|PARTIALLY|ACTION|WAITING|OPEN|UNDER_REVIEW/.test(
			upper,
		)
	) {
		return "warning";
	}
	if (
		/COMPLETE|FULFILLED|PAID|ACTIVE|PUBLISHED|ENABLED|RESOLVED|TOP_RATED|ABOVE_STANDARD/.test(
			upper,
		)
	) {
		return "success";
	}
	return "neutral";
}

export function toNumber(leaf: unknown): number | null {
	if (typeof leaf == "number") {
		return Number.isFinite(leaf) ? leaf : null;
	}
	if (typeof leaf == "string") {
		const parsed = Number(leaf);
		return Number.isFinite(parsed) ? parsed : null;
	}
	return null;
}

function isNumberOrBoolean(leaf: unknown): leaf is number | boolean {
	const isNumber = typeof leaf == "number";

	if (isNumber) return true;

	const isBoolean = typeof leaf == "boolean";

	if (isBoolean) return true;

	return false;
}

export function toLabel(leaf: unknown): string {
	if (typeof leaf == "string") {
		return leaf;
	}

	const isScalar = isNumberOrBoolean(leaf);

	if (isScalar) return String(leaf);

	return "";
}

export function truncate(text: string | undefined, max = 80): string {
	if (!text) {
		return "";
	}
	return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
