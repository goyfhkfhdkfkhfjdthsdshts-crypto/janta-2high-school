import { NextRequest } from 'next/server';
import { GET as authRegisterGET, POST as authRegisterPOST } from '@/app/api/auth/register/route';

export async function GET(req: NextRequest) {
  return authRegisterGET();
}

export async function POST(req: NextRequest) {
  return authRegisterPOST(req);
}
