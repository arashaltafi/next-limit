import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Configuration for rate limiting
const RATE_LIMIT_WINDOW = 2 * 60 * 1000; // 2 minutes in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 10; // Max requests per user in the window

// In-memory store to track user requests
const requestCache: Record<string, { count: number; firstRequest: number }> = {};

export function middleware(req: NextRequest) {
    if (req.nextUrl.pathname.startsWith('/api')) {
        const userIp = req.ip || 'unknown'; // Get user IP, default to 'unknown' if unavailable

        const currentTime = Date.now();

        // Initialize or update the user record in the cache
        if (!requestCache[userIp]) {
            // If user has no record, create one
            requestCache[userIp] = { count: 1, firstRequest: currentTime };
        } else {
            const userRecord = requestCache[userIp];
            const timeSinceFirstRequest = currentTime - userRecord.firstRequest;

            if (timeSinceFirstRequest < RATE_LIMIT_WINDOW) {
                // If within the time window, check request count
                if (userRecord.count >= RATE_LIMIT_MAX_REQUESTS) {
                    // Deny the request if rate limit exceeded
                    return NextResponse.json(
                        { error: 'Rate limit exceeded. Please wait before making more requests.' },
                        { status: 429 } // HTTP status for Too Many Requests
                    );
                } else {
                    // Increment the count if under the limit
                    userRecord.count += 1;
                }
            } else {
                // Reset the user's record if the window has expired
                requestCache[userIp] = { count: 1, firstRequest: currentTime };
            }
        }

        // Allow the request to continue
        return NextResponse.next();
    } else {
        // If not an API request, allow the request to continue
        return NextResponse.next();
    }
}