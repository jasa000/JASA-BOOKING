
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
import { useTheme, type ColorTheme, type Theme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Monitor, Moon, Sun, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppearancePage() {
    const { 
        colorTheme, 
        setColorTheme, 
        defaultTheme, 
        setDefaultTheme,
        settingsLoading,
        previewColorTheme,
        setPreviewColorTheme
    } = useTheme();

    const [selectedColorTheme, setSelectedColorTheme] = useState<ColorTheme>(colorTheme);
    const [selectedDefaultTheme, setSelectedDefaultTheme] = useState<Theme | undefined>(defaultTheme);

    const { toast } = useToast();

    // Sync local state when global theme loads from DB or changes
    useEffect(() => {
        if (!settingsLoading) {
            setSelectedColorTheme(colorTheme);
            setSelectedDefaultTheme(defaultTheme);
        }
    }, [colorTheme, defaultTheme, settingsLoading]);

    // Handle previewing the theme
    const handleSelectColorTheme = (theme: ColorTheme) => {
        setSelectedColorTheme(theme);
        setPreviewColorTheme(theme);
    };
    
    const handleSaveColor = () => {
        setColorTheme(selectedColorTheme);
        setPreviewColorTheme(null); // Clear preview on save
        toast({
            title: "Color Theme Saved",
            description: "Your new color theme has been applied application-wide.",
        });
    };

    const handleSaveDefaultTheme = () => {
        if(selectedDefaultTheme) {
            setDefaultTheme(selectedDefaultTheme);
            toast({
                title: "Default Theme Saved",
                description: `The default theme for new users is now '${selectedDefaultTheme}'.`,
            });
        }
    };

    const handleCancelColor = () => {
        setSelectedColorTheme(colorTheme);
        setPreviewColorTheme(null); // Clear preview on cancel
    };
    
    const handleCancelDefaultTheme = () => {
        setSelectedDefaultTheme(defaultTheme);
    }

    // Clear preview if user navigates away
    useEffect(() => {
        return () => {
            setPreviewColorTheme(null);
        };
    }, [setPreviewColorTheme]);

    const hasColorChanges = selectedColorTheme !== colorTheme;
    const hasThemeChanges = selectedDefaultTheme !== defaultTheme;

    if (settingsLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                 <div className="space-y-2 mb-8">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-5 w-2/3" />
                </div>
                <div className="grid gap-8 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardHeader>
                        <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardHeader>
                        <CardContent><Skeleton className="h-10 w-full" /></CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Appearance</h1>
                <p className="text-muted-foreground">
                    Customize the look and feel of your application for all users.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Global Color Theme</CardTitle>
                        <CardDescription>Select a color palette for the UI (light mode only).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ThemeSelector selectedTheme={selectedColorTheme} onSelectTheme={handleSelectColorTheme} />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                         {hasColorChanges && (
                            <Button variant="ghost" onClick={handleCancelColor}>Cancel</Button>
                         )}
                        <Button onClick={handleSaveColor} disabled={!hasColorChanges}>
                            Save Color Theme
                        </Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Global Default Theme</CardTitle>
                        <CardDescription>
                            Set the default theme for new users. Existing users can override this in their profile.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                         {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                             <button
                                key={t}
                                onClick={() => setSelectedDefaultTheme(t)}
                                className={cn(
                                    "relative rounded-lg border p-4 text-left transition-all",
                                    selectedDefaultTheme === t && "ring-2 ring-primary border-primary",
                                    defaultTheme === t && "bg-muted/50"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                     {t === 'light' && <Sun className="h-5 w-5" />}
                                     {t === 'dark' && <Moon className="h-5 w-5" />}
                                     {t === 'system' && <Monitor className="h-5 w-5" />}
                                     <span className="font-medium capitalize">{t}</span>
                                </div>
                                {defaultTheme === t && (
                                     <div className="absolute top-2 right-2 text-xs flex items-center gap-1 text-muted-foreground">
                                        <CheckCircle className="h-3 w-3" />
                                        Current Default
                                     </div>
                                )}
                             </button>
                         ))}
                    </CardContent>
                     <CardFooter className="flex justify-end gap-2">
                        {hasThemeChanges && (
                            <Button variant="ghost" onClick={handleCancelDefaultTheme}>Cancel</Button>
                        )}
                        <Button onClick={handleSaveDefaultTheme} disabled={!hasThemeChanges}>
                            Save Default Theme
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
