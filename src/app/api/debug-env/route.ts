import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  return NextResponse.json({
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    tokenPrefix: token ? token.substring(0, 10) + '...' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
  });
}
