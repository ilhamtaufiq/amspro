import "./bootstrap";
import "../css/app.css";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

// Fix for default Leaflet icons not found in production
L.Icon.Default.imagePath = '/images/';

import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { ThemeProvider } from "@/components/theme-provider";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { NavigationProgress } from "@/components/navigation-progress";
import React, { useState, useEffect } from 'react';

const appName = import.meta.env.VITE_APP_NAME || "AMSPRO";

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob("./pages/**/*.tsx")
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider>
                <NavigationProgress />
                <App {...props} />
                <AlertHandler flash={props.initialPage.props.flash as any} errors={props.initialPage.props.errors as any} />
            </ThemeProvider>
        );
    },
});

interface AlertHandlerProps {
    flash: { success?: string; error?: string; warning?: string; info?: string };
    errors?: Record<string, string[]>;
}

const AlertHandler: React.FC<AlertHandlerProps> = ({ flash, errors }) => {
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertDescription, setAlertDescription] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

    useEffect(() => {
        if (flash.success) {
            setAlertTitle('Success');
            setAlertDescription(flash.success);
            setAlertType('success');
            setAlertOpen(true);
        } else if (flash.error) {
            setAlertTitle('Error');
            setAlertDescription(flash.error);
            setAlertType('error');
            setAlertOpen(true);
        } else if (flash.warning) {
            setAlertTitle('Warning');
            setAlertDescription(flash.warning);
            setAlertOpen(true);
        } else if (flash.info) {
            setAlertTitle('Info');
            setAlertDescription(flash.info);
            setAlertType('info');
            setAlertOpen(true);
        } else if (Object.keys(errors || {}).length > 0) {
            setAlertTitle('Validasi Gagal');
            const errorMessages = Object.values(errors || {}).flat().join('\n');
            setAlertDescription(errorMessages);
            setAlertType('error');
            setAlertOpen(true);
        }
    }, [flash, errors]);

    const handleCloseAlert = () => {
        setAlertOpen(false);
        setAlertTitle('');
        setAlertDescription('');
    };

    return (
        <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
                    <AlertDialogDescription>{alertDescription}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={handleCloseAlert}>Tutup</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};