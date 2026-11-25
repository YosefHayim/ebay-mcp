import {
	createHash,
	createPrivateKey,
	type KeyObject,
	sign,
} from "node:crypto";

const SIGNATURE_LABEL = "sig1";

const SIGNATURE_KEY_HEADER = "x-ebay-signature-key";

const PEM_PATTERN = /-----BEGIN [A-Z ]*PRIVATE KEY-----/;

function signBase(signatureBase: string, key: KeyObject): string {
	const signatureBaseBytes = Buffer.from(signatureBase, "utf8");
	const digest = key.asymmetricKeyType == "ed25519" ? null : "sha256";
	return sign(digest, signatureBaseBytes, key).toString("base64");
}

function authorityOf(url: URL): string {
	return url.host.toLowerCase();
}

export interface SignableRequest {
	readonly method: string;
	readonly url: string;
	readonly bodyBytes?: string | Uint8Array;
}

export function parseSigningPrivateKey(privateKey: string): KeyObject {
	const trimmed = privateKey.trim().replaceAll("\\n", "\n");
	let key: KeyObject;
	try {
		key = PEM_PATTERN.test(trimmed)
			? createPrivateKey(trimmed)
			: createPrivateKey({
					key: Buffer.from(trimmed.replaceAll(/\s/g, ""), "base64"),
					format: "der",
					type: "pkcs8",
				});
	} catch (cause) {
		throw new Error(
			"EBAY_SIGNING_PRIVATE_KEY could not be parsed. Use the privateKey value returned by ebay_create_signing_key (base64 PKCS#8) or a PEM private key.",
			{ cause },
		);
	}

	const isEd25519Key = key.asymmetricKeyType == "ed25519";

	if (isEd25519Key) {
		return key;
	}

	const isRsaKey = key.asymmetricKeyType == "rsa";

	if (isRsaKey) {
		return key;
	}

	throw new Error(
		`EBAY_SIGNING_PRIVATE_KEY is a ${key.asymmetricKeyType ?? "unknown"} key; eBay digital signatures accept only ED25519 or RSA keys.`,
	);
}

export function computeContentDigest(bodyBytes: string | Uint8Array): string {
	return `sha-256=:${createHash("sha256").update(bodyBytes).digest("base64")}:`;
}

export function buildSignatureBase(
	components: ReadonlyArray<readonly [string, string]>,
	signatureParams: string,
): string {
	return [
		...components.map(([name, value]) => `"${name}": ${value}`),
		`"@signature-params": ${signatureParams}`,
	].join("\n");
}

export function signEbayRequest(
	request: SignableRequest,
	jwe: string,
	key: KeyObject,
	now: number = Date.now(),
): Record<string, string> {
	const url = new URL(request.url);
	const created = Math.floor(now / 1000);
	const headers: Record<string, string> = { [SIGNATURE_KEY_HEADER]: jwe };
	const components: Array<readonly [string, string]> = [];

	if (request.bodyBytes !== undefined) {
		const contentDigest = computeContentDigest(request.bodyBytes);
		headers["Content-Digest"] = contentDigest;
		components.push(["content-digest", contentDigest]);
	}
	components.push(
		[SIGNATURE_KEY_HEADER, jwe],
		["@method", request.method.toUpperCase()],
		["@path", url.pathname],
		["@authority", authorityOf(url)],
	);

	const signatureParams = `(${components.map(([name]) => `"${name}"`).join(" ")});created=${created}`;
	const signatureBase = buildSignatureBase(components, signatureParams);
	const signature = signBase(signatureBase, key);

	headers["Signature-Input"] = `${SIGNATURE_LABEL}=${signatureParams}`;
	headers["Signature"] = `${SIGNATURE_LABEL}=:${signature}:`;
	return headers;
}
