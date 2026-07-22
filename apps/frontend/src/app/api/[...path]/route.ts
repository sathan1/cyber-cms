import { NextRequest, NextResponse } from 'next/server';

const RAILWAY_BACKEND_HOST = 'cyber-cms-production.up.railway.app';
const RAILWAY_BACKEND_URL = `https://${RAILWAY_BACKEND_HOST}/api`;

async function proxyRequest(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathStr = (resolvedParams.path || []).join('/');
  
  // Extract query string
  const searchParams = request.nextUrl.search;
  const targetUrl = `${RAILWAY_BACKEND_URL}/${pathStr}${searchParams}`;

  // Copy request headers and set host header explicitly for Railway
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'host') {
      headers.set(key, value);
    }
  });
  headers.set('Host', RAILWAY_BACKEND_HOST);

  const requestInit: RequestInit = {
    method: request.method,
    headers: headers,
    cache: 'no-store',
  };

  // Pass body for non-GET/HEAD requests
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      const bodyText = await request.text();
      if (bodyText) {
        requestInit.body = bodyText;
      }
    } catch {
      // No request body
    }
  }

  try {
    const backendResponse = await fetch(targetUrl, requestInit);
    const responseData = await backendResponse.text();

    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'transfer-encoding' && key.toLowerCase() !== 'content-encoding') {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(responseData, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Backend connection failed: ' + (err.message || 'Unknown error') },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
