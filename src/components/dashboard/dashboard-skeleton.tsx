import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

export function DashboardSkeleton() {
    return (
        <>
            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24"/>
                            <Skeleton className="h-4 w-4"/>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-32 mb-2"/>
                            <Skeleton className="h-3 w-40"/>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Chart + Rankings */}
            <div className="grid gap-4 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <Skeleton className="h-5 w-36 mb-1"/>
                        <Skeleton className="h-4 w-52"/>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-72 w-full"/>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <Skeleton className="h-5 w-40 mb-1"/>
                        <Skeleton className="h-4 w-36"/>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-full shrink-0"/>
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-28"/>
                                    <Skeleton className="h-3 w-20"/>
                                </div>
                                <Skeleton className="h-4 w-16"/>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Expenses */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-36 mb-1"/>
                    <Skeleton className="h-4 w-40"/>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-full shrink-0"/>
                            <div className="flex-1 space-y-1">
                                <Skeleton className="h-4 w-32"/>
                                <Skeleton className="h-3 w-24"/>
                            </div>
                            <Skeleton className="h-4 w-16"/>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </>
    );
}
