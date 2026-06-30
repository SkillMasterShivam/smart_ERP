'use client';

import { useCompany } from '@/context/CompanyContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function CompaniesPage() {
  const { companies, selectCompany, activeCompany, isLoadingCompanies } = useCompany();

  if (isLoadingCompanies) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <p>Loading companies...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Your Companies</h1>
        <Button asChild>
          <Link href="/companies/new">Create New Company</Link>
        </Button>
      </div>

      {companies.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>No companies found</CardTitle>
            <CardDescription>You don't have any companies yet. Create one to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="mt-4">
              <Link href="/companies/new">Create Company</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company.id} className={activeCompany?.id === company.id ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle>{company.name}</CardTitle>
                <CardDescription>{company.business_type || 'General Business'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p><span className="font-semibold">GST:</span> {company.gst_no || 'N/A'}</p>
                  <p><span className="font-semibold">Country:</span> {company.country}</p>
                  <p><span className="font-semibold">Currency:</span> {company.currency}</p>
                  <p><span className="font-semibold">FY Start:</span> {new Date(company.fy_start).toLocaleDateString()}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant={activeCompany?.id === company.id ? "secondary" : "default"}
                  onClick={() => selectCompany(company)}
                  disabled={activeCompany?.id === company.id}
                >
                  {activeCompany?.id === company.id ? 'Active' : 'Select'}
                </Button>
                {/* <Button variant="outline" asChild>
                  <Link href={`/companies/${company.id}/edit`}>Edit</Link>
                </Button> */}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
