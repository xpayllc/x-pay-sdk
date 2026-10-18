export interface CreatePaymentParams {
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, string>;
}
export interface XPayPayment {
    id: string;
    amount: number;
    currency: string;
    status: string;
    description?: string;
    clientSecret?: string;
    createdAt: string;
}
export interface XPayClientOptions {
    secretKey?: string;
    apiKey?: string;
    baseUrl?: string;
}
export declare class XPayError extends Error {
    type?: string;
    statusCode?: number;
    constructor(message: string, options?: {
        type?: string;
        statusCode?: number;
    });
}
declare class PaymentsResource {
    private client;
    constructor(client: XPayClient);
    create(params: CreatePaymentParams): Promise<XPayPayment>;
    retrieve(id: string): Promise<XPayPayment>;
}
declare class XPayClient {
    private secretKey;
    private baseUrl;
    constructor(options: XPayClientOptions);
    request<T>(method: string, path: string, body?: unknown): Promise<T>;
}
export declare class XPay {
    payments: PaymentsResource;
    constructor(options: XPayClientOptions);
}
export {};
