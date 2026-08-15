"use client";

import AdminGuard from "@/components/AdminGuard";
import AdminShell from "@/components/AdminShell";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminLayout({children}){
  const [user,setUser]=useState(null);
  useEffect(()=>{api.me().then(d=>setUser(d.user)).catch(()=>{})},[]);
  return <AdminGuard><AdminShell user={user}>{children}</AdminShell></AdminGuard>
}
