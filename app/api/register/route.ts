import { NextRequest } from 'next/server';
import { GET as authRegisterGET, POST as authRegisterPOST, OPTIONS as authRegisterOPTIONS } from '@/app/api/auth/register/route';

export async function OPTIONS(req: NextRequest) {
  return authRegisterOPTIONS(req);
}

export async function GET(req: NextRequest) {
  return authRegisterGET(req);
}

export async function POST(req: NextRequest) {
  return authRegisterPOST(req);
}
