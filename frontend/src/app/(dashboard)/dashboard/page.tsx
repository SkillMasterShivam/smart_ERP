'use client';

import { useCompany } from '@/context/CompanyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MENU_ITEMS } from '@/components/layout/sidebar';
import Link from 'next/link';

export default function DashboardPage() {
  const { activeCompany } = useCompany();

  // Group menu items by category
  const groupedItems = MENU_ITEMS.filter(item => item.name !== 'Gateway').reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof MENU_ITEMS>);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gateway of SmartERP</h1>
        <p className="text-gray-500 mt-2">
          {activeCompany?.name} | FY: {new Date(activeCompany?.fy_start || '').getFullYear()} - {new Date(activeCompany?.fy_start || '').getFullYear() + 1}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <Card key={category} className="shadow-sm border-gray-200">
            <CardHeader className="bg-gray-50/50 border-b pb-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                {category}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-100">
                {items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="group flex items-center px-4 py-3 hover:bg-primary/5 transition-colors focus:outline-none focus:bg-primary/10"
                    >
                      <item.icon className="h-5 w-5 text-gray-400 group-hover:text-primary mr-3" />
                      <span className="font-medium text-gray-700 group-hover:text-primary">
                        {item.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
