export class XPayError extends Error {
    type;
    statusCode;
    constructor(message, options) {
        super(message);
        this.name = "XPayError";
        this.type = options?.type;
        this.statusCode = options?.statusCode;
    }
}
class PaymentsResource {
    client;
    constructor(client) {
        this.client = client;
    }
    async create(params) {
        return this.client.request("POST", "/v1/payments", params);
    }
    async retrieve(id) {
        return this.client.request("GET", `/v1/payments/${encodeURIComponent(id)}`);
    }
}
class XPayClient {
    secretKey;
    baseUrl;
    constructor(options) {
        if (!(options.secretKey ?? options.apiKey)) {
            throw new XPayError("X Pay secret key is required");
        }
        const key = options.secretKey ?? options.apiKey;
        if (!["xpay_sk_", "xp_test_", "xp_live_"].some(prefix => key.startsWith(prefix))) {
            throw new XPayError("Invalid X Pay secret key format");
        }
        this.secretKey = key;
        this.baseUrl = (options.baseUrl ?? "https://www.app-xpay.com").replace(/\/$/, "");
    }
    async request(method, path, body) {
        const url = `${this.baseUrl}${path}`;
        const response = await fetch(url, {
            method,
            headers: {
                Authorization: `Bearer ${this.secretKey}`,
                "Content-Type": "application/json",
            },
            body: body ? JSON.stringify(body) : undefined,
        });
        const data = (await response.json());
        if (!response.ok) {
            throw new XPayError(data.error?.message ?? "Request failed", {
                type: data.error?.type,
                statusCode: response.status,
            });
        }
        return data;
    }
}
export class XPay {
    payments;
    constructor(options) {
        const client = new XPayClient(options);
        this.payments = new PaymentsResource(client);
    }
}
