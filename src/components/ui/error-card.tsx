import {AlertCircle} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";

interface ErrorCardProps {
    title: string;
    description?: string;
}

export function ErrorCard({title, description = "Please try again later."}: ErrorCardProps) {
    return (
        <Card>
            <CardContent className="flex items-center justify-center gap-3 py-12">
                <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true"/>
                <div>
                    <p className="text-sm font-medium text-destructive">{title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}
