import { PropsWithChildren, ReactNode } from "react";
import { AuthenticatedLayout as ModernAuthenticatedLayout } from "./layout/authenticated-layout";

export default function AuthenticatedLayout({
    user,
    header,
    children
}: PropsWithChildren<{
    user: any; // Define the user prop
    header?: ReactNode;
}>) {
    return (
        <ModernAuthenticatedLayout user={user} header={header}>
            {children}
        </ModernAuthenticatedLayout>
    );
}