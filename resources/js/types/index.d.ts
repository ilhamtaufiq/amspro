import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, ReactNode, RefAttributes } from "react";

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    roles: { id: number; name: string }[];
    permissions?: string[];
    created_at?: string;
    updated_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: {
        user: User;
    };
    [key: string]: any;
};

export type MenuItemProp = {
    title: string;
    href: string;
    icon?:
        | ForwardRefExoticComponent<
              Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
          >
        | ReactNode;
    variant:
        | "link"
        | "default"
        | "ghost"
        | "destructive"
        | "outline"
        | "secondary"
        | null
        | undefined;
};
