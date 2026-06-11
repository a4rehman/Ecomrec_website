import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return <section className="container-lux py-24 text-center"><h1 className="font-serif text-7xl">Page Not Found</h1><p className="mt-5 text-muted">This page has left the collection.</p><Link href="/"><Button className="mt-8">Return Home</Button></Link></section>;
}
