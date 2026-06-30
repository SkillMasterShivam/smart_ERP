import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Receipt } from 'lucide-react';

export default function TransactionsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-sm text-gray-500">Manage daily business activities and vouchers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow border-primary/20 bg-primary/5">
          <Link href="/transactions/purchases" className="block h-full">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <ShoppingCart className="mr-2 h-5 w-5 text-primary" />
                Purchase Vouchers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Record inbound stock, supplier invoices, and update inventory instantly.</p>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow border-primary/20 bg-primary/5">
          <Link href="/transactions/sales" className="block h-full">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Receipt className="mr-2 h-5 w-5 text-primary" />
                Sales Vouchers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Record outbound stock and generate customer invoices.</p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
