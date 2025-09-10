export interface ApiResponse<T> {
    data: T;
    status: number;
    ok: boolean;
}

export interface ApiError extends Error {
    status?: number;
    response?: Response;
}

export interface FetchOptions extends RequestInit {
    timeout?: number;
}

const DEFAULT_TIMEOUT = 10000; // 10 seconds

let API_BASE = import.meta.env.API_BASE || "";

let tokenAuth: string | null = null;
let jwtAuth: string | null = null;

/**
 * Get a cookie by name
 * @param name The name of the cookie
 * @returns The cookie value or an empty string if not found
 */
function getCookie(name: string): string {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(';').shift()!;
    return "";
}

/**
 * Build headers for the API request
 * @param extra Additional headers to include
 * @returns A record of headers
 */
function buildHeaders(extra: Record<string, string> = {}) {
    const h: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        "X-CSRFToken": getCookie("csrftoken"),
        ...extra
    };
    if (tokenAuth) h.Authorization = `Token ${tokenAuth}`;
    else if (jwtAuth) h.Authorization = `Bearer ${jwtAuth}`;
    return h;
}

export function setApiBase(base: string) { API_BASE = base; }
export function setTokenAuth(token: string | null) { tokenAuth = token; }
export function setJwtAuth(token: string | null) { jwtAuth = token; }

/**
 * Agree to the terms of service
 * @returns A promise that resolves when the terms are accepted
 */
export async function agreeToTerms(): Promise<any> {
    const url = `${API_BASE}/api/terms/agree/`;
    return apiPost<any>(url, {});
}

/**
 * Base fetch function with timeout, error handling, and consistent response format
 * @template T Response type
 * @param url The endpoint URL
 * @param options Fetch options including method, headers, body, timeout
 * @returns A promise that resolves to ApiResponse<T>
 */
export async function baseFetch<T = any>(
    url: string,
    options: FetchOptions = {}
): Promise<ApiResponse<T>> {
    const { timeout = DEFAULT_TIMEOUT, headers = {}, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers: buildHeaders(headers as Record<string, string>),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        let data: T;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text() as unknown as T;
        }

        return { data, status: response.status, ok: response.ok };
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            const errorMessage = `Request timeout after ${timeout}ms`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
        console.error('Fetch error:', error);
        throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
}

/**
 * GET request wrapper
 * @template T Response type
 * @param url The endpoint URL
 * @param options Additional fetch options
 * @returns A promise that resolves to the response data
 */
export async function apiGet<T = any>(
    url: string,
    options: Omit<FetchOptions, 'method' | 'body'> = {}
): Promise<T> {
    const response = await baseFetch<T>(url, {
        ...options,
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(options.headers as Record<string, string> | undefined),
    });
    if (!response.ok) {
        const error = new Error(`GET ${url} failed with status ${response.status}`) as ApiError;
        error.status = response.status;
        console.error("Get error:", error);
        throw error;
    }
    return response.data;
}

/**
 * POST request wrapper
 * @template T Response type
 * @template U Request body type
 * @param url The endpoint URL
 * @param data The request body data
 * @param options Additional fetch options
 * @returns A promise that resolves to the response data
 */
// Ensure status is set so callers can branch on it.
export async function apiPost<T = any, U = any>(
    url: string,
    data?: U,
    options: Omit<FetchOptions, 'method' | 'body'> = {}
): Promise<T> {
    const response = await baseFetch<T>(url, {
        ...options,
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(options.headers as any),
        body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
        const error = new Error(`POST ${url} failed with status ${response.status}`) as ApiError;
        error.status = response.status;
        console.error(createErrorMessage(`POST ${url}`, error, response));
        throw error;
    }
    return response.data;
}

// Add PATCH helper
export async function apiPatch<T = any, U = any>(
    url: string,
    data?: U,
    options: Omit<FetchOptions, 'method' | 'body'> = {}
): Promise<T> {
    const response = await baseFetch<T>(url, {
        ...options,
        method: 'PATCH',
        credentials: 'include',
        headers: buildHeaders(options.headers as any),
        body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
        const error = new Error(`PATCH ${url} failed with status ${response.status}`) as ApiError;
        error.status = response.status;
        console.error(createErrorMessage(`PATCH ${url}`, error, response));
        throw error;
    }
    return response.data;
}

/**
 * Handle errors consistently
 */
export function createErrorMessage(context: string, error: ApiError, response: ApiResponse<any>): string {
    if (error) {
        const apiError = error as ApiError;

        apiError.message = "";

        if (context && context.length > 0) apiError.message = context;

        if (apiError.status === 400) {
            apiError.message += ' Bad request';
        } else if (apiError.status === 401) {
            apiError.message += ' Authentication required';
        } else if (apiError.status === 403) {
            apiError.message += ' Permission denied';
        } else if (apiError.status === 404) {
            apiError.message += ' Resource not found';
        } else if (apiError.status === 422) {
            apiError.message += ' Validation error';
        } else if (apiError.status === 500) {
            apiError.message += ' Server error';
        } else {
            apiError.message += ` ${error.status}`;
        }

        if (response) {
            apiError.message += ", response: " + JSON.stringify(response.data);
        }

        return apiError.message;
    }

    return 'Unknown error occurred';
}

// Raw comment shape (adjust if yaml differs)
export interface RawComment {
    id: number;
    object_pk: number;
    comment: string;
    user_name?: string;
    created?: string;
    parent?: number | null;

    ratings?: {
        positive_ratings?: number;
        negative_ratings?: number;
        current_user_rating_value?: number | null; // 1, -1, or null
        current_user_rating_id?: number | null;
    };

    // optional nesting from list responses
    child_comments?: RawComment[];
}

/**
 * List comments for a specific object
 * @param contentType The content type ID
 * @param objectPk The object primary key
 * @returns A promise that resolves to an array of comments
 */
export async function listObjectComments(contentType: number, objectPk: number): Promise<RawComment[]> {
    const url = `${API_BASE}/api/contenttypes/${contentType}/objects/${objectPk}/arpas-comments/`;
    const data = await apiGet<any>(url);
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data)) return data;
    return [];
}

/**
 * Create a new comment
 * @param contentType The content type ID
 * @param objectPk The object primary key
 * @param text The comment text
 * @param parentId The parent comment ID (optional)
 * @returns A promise that resolves to the created comment
 */
export async function createObjectComment(
    contentType: number,
    objectPk: number,
    text: string,
    parentId?: number
): Promise<RawComment> {
    const url = `${API_BASE}/api/contenttypes/${contentType}/objects/${objectPk}/arpas-comments/`;
    const body: any = { comment: text, agreed_terms_of_use: true };
    if (parentId) body.parent = parentId;
    return apiPost<RawComment, typeof body>(url, body);
}

// Ratings API types
export type RatingTarget = "variant" | "comment";

export interface RawRating {
    id?: number;
    content_type: number;
    object_pk: number;
    target: RatingTarget;
    target_id: number;
    value: 1 | -1 | 0 | null;
    positive_rating_count?: number;
    negative_rating_count?: number;
    meta_info?: {
        positive_ratings_on_same_object?: number;
        negative_ratings_on_same_object?: number;
        user_rating_on_same_object_value?: 1 | -1 | 0 | null;
        user_rating_on_same_object_id?: number | null;
    };
}

/**
 * List all ratings for an object (variants + comments)
 * @param contentType The content type ID
 * @param objectPk The object primary key
 * @returns A promise that resolves to an array of ratings
 */
export async function listObjectRatings(
    contentType: number,
    objectPk: number
): Promise<RawRating[]> {
    const url = `${API_BASE}/api/contenttypes/${contentType}/objects/${objectPk}/arpas-ratings/`;
    const data = await apiGet<any>(url);
    if (Array.isArray(data?.results)) return data.results as RawRating[];
    if (Array.isArray(data)) return data as RawRating[];
    return [];
}

/**
 * Submit a rating for a specific object and target
 * @param contentType The content type ID
 * @param objectPk The object primary key
 * @param target The target being rated (variant or comment)
 * @param targetId The ID of the target being rated
 * @param reaction The user's reaction (like, dislike, or clear)
 * @returns A promise that resolves to the submitted rating
 */
export async function submitObjectRating(
    contentType: number,
    objectPk: number,
    target: RatingTarget,
    targetId: number,
    reaction: "like" | "dislike" | "clear",
    ratingId?: number | null
): Promise<RawRating | any> {
    const value = reaction === "like" ? 1 : reaction === "dislike" ? -1 : 0;

    if (ratingId) {
        const patchUrl = `${API_BASE}/api/contenttypes/${contentType}/objects/${objectPk}/arpas-ratings/${ratingId}/`;
        const patchBody = { value, agreed_terms_of_use: true };
        try {
            return await apiPatch<RawRating, typeof patchBody>(patchUrl, patchBody);
        } catch (e) {
            const status = (e as ApiError)?.status;
            if (status === 404 || status === 405) {
                console.warn("PATCH rating not supported, falling back to POST", e);
                // fall through to POST below
            } else {
                throw e;
            }
        }
    }

    const url = `${API_BASE}/api/contenttypes/${contentType}/objects/${objectPk}/arpas-ratings/`;
    const body = { target, target_id: targetId, value, agreed_terms_of_use: true };
    return await apiPost<RawRating, typeof body>(url, body);
}