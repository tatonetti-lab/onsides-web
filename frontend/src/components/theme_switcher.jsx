import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeSwitcher() {
    const { theme, setTheme, resolvedTheme } = useTheme();

    // State to ensure the component only renders on the client side
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // Prevent rendering until mounted to avoid hydration errors
    if (!mounted) return null;

    const isDark = resolvedTheme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
            aria-label="Toggle Theme"
        >
            {isDark ? (
                <Sun className="h-5 w-5 text-foreground" />
            ) : (
                <Moon className="h-5 w-5 text-foreground" />
            )}
        </button>
    );
}

