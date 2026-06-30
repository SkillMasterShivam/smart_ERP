import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, BookOpen } from 'lucide-react';

export default function MastersPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Masters Data</h1>
        <p className="text-gray-500">Manage foundational data for your ERP.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <Link href="/masters/ledgers" className="block h-full">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <BookOpen className="mr-2 h-5 w-5 text-primary" />
                Ledgers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Manage your Chart of Accounts, Customers, Suppliers, and Bank accounts.</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <Link href="/masters/groups" className="block h-full">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Briefcase className="mr-2 h-5 w-5 text-primary" />
                Account Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Define the hierarchical structure of your accounting system.</p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
