'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Calculator,
  Briefcase,
  Building2,
  Landmark,
  FileText,
  PieChart,
  Wrench,
  Settings,
} from 'lucide-react';

export const MENU_ITEMS = [
  { name: 'Gateway', href: '/dashboard', icon: LayoutDashboard, category: 'Main' },
  { name: 'Masters', href: '/masters', icon: Briefcase, category: 'Configuration' },
  { name: 'Transactions', href: '/transactions', icon: Calculator, category: 'Operations' },
  { name: 'Inventory', href: '/inventory', icon: ShoppingBag, category: 'Operations' },
  { name: 'Accounting', href: '/accounting', icon: FileText, category: 'Operations' },
  { name: 'Customers', href: '/customers', icon: Users, category: 'Entities' },
  { name: 'Suppliers', href: '/suppliers', icon: Building2, category: 'Entities' },
  { name: 'Banking', href: '/banking', icon: Landmark, category: 'Finance' },
  { name: 'GST', href: '/gst', icon: PieChart, category: 'Compliance' },
  { name: 'Reports', href: '/reports', icon: FileText, category: 'Analysis' },
  { name: 'Utilities', href: '/utilities', icon: Wrench, category: 'System' },
  { name: 'Administration', href: '/admin', icon: Settings, category: 'System' },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={cn("pb-12 border-r bg-white w-64 hidden lg:block overflow-y-auto", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-primary">
            SmartERP
          </h2>
          <div className="space-y-1">
            {MENU_ITEMS.map((item) => (
              <Button
                key={item.name}
                variant={pathname === item.href || pathname.startsWith(item.href + '/') && item.href !== '/dashboard' ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname === item.href ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-600 font-normal"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline Button component wrapper if needed, or import from shadcn
import { Button } from '@/components/ui/button';
