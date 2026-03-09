import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://b34hb46zsj.execute-api.us-east-1.amazonaws.com/prod';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest(request, path, 'GET');
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest(request, path, 'POST');
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest(request, path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest(request, path, 'DELETE');
}

async function proxyRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  try {
    const pathname = path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${API_BASE_URL}/api/auth/${pathname}${searchParams ? `?${searchParams}` : ''}`;

    console.log(`🔄 [AUTH-PROXY] ${method} ${url}`);

    // Extrair headers importantes
    const authorization = request.headers.get('authorization');
    if (authorization) {
      console.log('🔑 [AUTH-PROXY] Authorization header:', `${authorization.substring(0, 30)}...`);
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Repassar Authorization header se existir
    if (authorization) {
      headers['Authorization'] = authorization;
    }

    // Preparar body para POST/PUT
    let body: string | undefined;
    if (method === 'POST' || method === 'PUT') {
      const requestBody = await request.json();
      body = JSON.stringify(requestBody);
      console.log('📦 [AUTH-PROXY] Request body:', JSON.stringify(requestBody, null, 2));
    }

    // Fazer request para a API
    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    console.log(`📡 [AUTH-PROXY] Response status: ${response.status}`);

    // Obter response body
    const data = await response.text();

    // Retornar response com mesmo status
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('❌ [AUTH-PROXY] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao se comunicar com a API de autenticação' },
      { status: 500 }
    );
  }
}
