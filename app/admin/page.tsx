import type { Metadata } from "next";
import CloudAdmin from "../../components/CloudAdmin";
import { isCloudConfigured } from "../../lib/neon/auth";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Secure Admin CMS",robots:{index:false,follow:false}};
export default function AdminPage(){return <CloudAdmin configured={isCloudConfigured()}/>;}
