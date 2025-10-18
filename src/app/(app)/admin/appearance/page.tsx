
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ThemeSelector } from '@/components/theme-selector';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AppearancePage() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Appearance</h1>
                <p className="text-muted-foreground">
                    Customize the look and feel of your application.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Color Theme</CardTitle>
                        <CardDescription>Select a color palette for the UI.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ThemeSelector />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Theme</CardTitle>
                        <CardDescription>Choose between light, dark, or system preference.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                         <Button
                            variant={theme === 'light' ? 'default' : 'outline'}
                            onClick={() => setTheme('light')}
                            className={cn("flex-1", theme === 'light' && "ring-2 ring-ring")}
                        >
                            <Sun className="mr-2 h-4 w-4" />
                            Light
                        </Button>
                        <Button
                            variant={theme === 'dark' ? 'default' : 'outline'}
                            onClick={() => setTheme('dark')}
                            className={cn("flex-1", theme === 'dark' && "ring-2 ring-ring")}
                        >
                            <Moon className="mr-2 h-4 w-4" />
                            Dark
                        </Button>
                         <Button
                            variant={theme === 'system' ? 'default' : 'outline'}
                            onClick={() => setTheme('system')}
                            className={cn("flex-1", theme === 'system' && "ring-2 ring-ring")}
                        >
                            <Monitor className="mr-2 h-4 w-4" />
                            System
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
