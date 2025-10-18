
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { ThemeSelector } from '@/components/theme-selector';
import { useTheme, type ColorTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function AppearancePage() {
    const { theme, setTheme, colorTheme, setColorTheme } = useTheme();
    const [selectedColorTheme, setSelectedColorTheme] = useState<ColorTheme>(colorTheme);
    const { toast } = useToast();

    useEffect(() => {
        setSelectedColorTheme(colorTheme);
    }, [colorTheme]);

    const handleSave = () => {
        setColorTheme(selectedColorTheme);
        toast({
            title: "Theme Saved",
            description: "Your new color theme has been applied.",
        });
    };

    const handleCancel = () => {
        setSelectedColorTheme(colorTheme);
    };

    const hasChanges = selectedColorTheme !== colorTheme;

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
                        <CardDescription>Select a color palette for the UI (light mode only).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ThemeSelector selectedTheme={selectedColorTheme} onSelectTheme={setSelectedColorTheme} />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                         {hasChanges && (
                            <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                         )}
                        <Button onClick={handleSave} disabled={!hasChanges}>
                            Save
                        </Button>
                    </CardFooter>
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
