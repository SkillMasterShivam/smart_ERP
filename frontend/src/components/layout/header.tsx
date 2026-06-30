'use client';

import { useAuth } from '@/context/AuthContext';
import { useCompany } from '@/context/CompanyContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Menu, Search, Building } from 'lucide-react';
import Link from 'next/link';
import { MENU_ITEMS } from './sidebar';

export function Header() {
  const { user, logout } = useAuth();
  const { activeCompany, clearCompany } = useCompany();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full overflow-y-auto pb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-primary">SmartERP</h2>
            </div>
            <nav className="flex-1 px-4 space-y-1">
              {MENU_ITEMS.map((item) => (
                <Button key={item.name} variant="ghost" className="w-full justify-start text-gray-600" asChild>
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {activeCompany ? (
          <div className="hidden sm:flex flex-col ml-auto">
            <span className="text-sm font-semibold truncate max-w-[200px] xl:max-w-[300px]">
              {activeCompany.name}
            </span>
            <span className="text-xs text-gray-500">
              FY: {new Date(activeCompany.fy_start).getFullYear()} - {new Date(activeCompany.fy_start).getFullYear() + 1}
            </span>
          </div>
        ) : (
          <div className="ml-auto" />
        )}
        
        {/* Search Placeholder */}
        <div className="hidden md:flex ml-4 flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="search"
              placeholder="Search..."
              className="pl-8 h-9 w-[200px] lg:w-[300px] rounded-md border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>{user?.email}</DropdownMenuItem>
            <DropdownMenuSeparator />
            {activeCompany && (
              <DropdownMenuItem onClick={clearCompany} className="cursor-pointer text-blue-600">
                <Building className="mr-2 h-4 w-4" />
                Switch Company
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
