import jwt from "jsonwebtoken"; import { cookies } from "next/headers";
const secret=()=>process.env.NEXTAUTH_SECRET || "dev-only-change-me";
export type Session={id:string;email:string;role:string;fullName:string};
export function signToken(user:Session){return jwt.sign(user,secret(),{expiresIn:"7d"});}
export function verifyToken(token:string){return jwt.verify(token,secret()) as Session;}
export async function getSession(){const c=await cookies(); const t=c.get("leonardx_token")?.value; if(!t)return null; try{return verifyToken(t)}catch{return null}}

export function isAdminSession(s: Session | null){ return !!s && s.role === "ADMIN" && s.email.toLowerCase() === "leonardudoh5@gmail.com"; }
