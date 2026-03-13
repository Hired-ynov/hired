import { NextResponse } from 'next/server';

export async function GET() {
  const response = await fetch('https://country.io/phone.json');
  const data = await response.json();

  return NextResponse.json(data);
}
