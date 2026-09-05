import Portfolio from '@/components/Portfolio';
import { projects } from '@/lib/projects';
export function generateStaticParams(){return projects.map(project=>({slug:project.slug}));}
export default async function Page({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const index=projects.findIndex(project=>project.slug===slug);
  return <Portfolio initialPage="Projects" initialProject={index>=0?index:null}/>;
}

