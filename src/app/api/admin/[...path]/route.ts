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
    const url = `${API_BASE_URL}/api/admin/${pathname}${searchParams ? `?${searchParams}` : ''}`;


    // Extrair headers importantes
    const authorization = request.headers.get('authorization');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authorization) {
      headers['Authorization'] = authorization;
    }

    // Preparar body para POST/PUT
    let body: string | undefined;
    if (method === 'POST' || method === 'PUT') {
      try {
        const jsonBody = await request.json();
        body = JSON.stringify(jsonBody);
      } catch (err) {
        console.error('❌ [PROXY] Error parsing body:', err);
      }
    }

    // Fazer request para a API
    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    // Obter response body
    const data = await response.text();

    // Para status 204 No Content, não pode ter body
    if (response.status === 204) {
      return new NextResponse(null, {
        status: 204,
      });
    }

    // Retornar response com mesmo status
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('❌ [PROXY] Error:', error);
    return NextResponse.json(
      {
        error: 'Erro ao se comunicar com a API',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
