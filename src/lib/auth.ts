import jwt from "jsonwebtoken"; import { cookies } from "next/headers";
const secret=()=>process.env.NEXTAUTH_SECRET || "dev-only-change-me";
export type Session={id:string;email:string;role:string;fullName:string};
export function signToken(user:Session){return jwt.sign(user,secret(),{expiresIn:"7d"});}
export function verifyToken(token:string){return jwt.verify(token,secret()) as Session;}
export async function getSession(){const c=await cookies(); const t=c.get("leonardx_token")?.value; if(!t)return null; try{return verifyToken(t)}catch{return null}}

export function isAdminSession(s: Session | null) {
  if (!s || s.role !== "ADMIN") return false;
  const allowed = (process.env.ADMIN_EMAILS || "leonardudoh5@gmail.com")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(s.email.toLowerCase());
}
