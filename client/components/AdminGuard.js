"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Loading from "./Loading";

export default function AdminGuard({children}){
  const [state,setState]=useState("loading"); const router=useRouter();
  useEffect(()=>{api.me().then(d=>{if(d.user?.role==="admin")setState("ok");else router.replace("/")}).catch(()=>router.replace("/"))},[router]);
  if(state==="loading")return <Loading label="Checking admin access..." />;
  return children;
}
