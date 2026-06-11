import { BarChart3, Boxes, ShoppingCart, Star, Tags, Users } from "lucide-react";

export default function AdminPage() {
  const cards = [["Revenue", "$42.8k"], ["Orders", "384"], ["Conversion", "5.8%"], ["AOV", "$161"]];
  const modules = [[Boxes, "Product Management"], [Tags, "Category Management"], [ShoppingCart, "Order Management"], [Users, "User Management"], [Star, "Review Management"], [BarChart3, "Sales Analytics"]];
  return <section className="container-lux py-14"><h1 className="mb-8 font-serif text-6xl">Admin Dashboard</h1><div className="grid gap-4 md:grid-cols-4">{cards.map(([k, v]) => <div className="glass p-6" key={k}><p className="tracked-luxury text-xs text-muted">{k}</p><b className="mt-3 block text-3xl">{v}</b></div>)}</div><div className="mt-8 grid gap-4 md:grid-cols-3">{modules.map(([Icon, label]) => <div className="border border-line p-6" key={String(label)}><Icon className="text-accent" /><h2 className="mt-5 font-serif text-3xl">{String(label)}</h2><p className="mt-2 text-muted">Create, edit, moderate, analyze, and export.</p></div>)}</div></section>;
}
