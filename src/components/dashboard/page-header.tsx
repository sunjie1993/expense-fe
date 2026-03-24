import {type ReactNode} from "react";

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    children?: ReactNode;
}

export function PageHeader({title, description, actions, children}: Readonly<PageHeaderProps>) {
    return (
        <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                    {description && (
                        <p className="text-sm text-muted-foreground hidden sm:block">{description}</p>
                    )}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
            {children && <div className="px-4 pb-3">{children}</div>}
        </div>
    );
}
