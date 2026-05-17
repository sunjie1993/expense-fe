"use client";

import {useAdminCategories, useMainCategories} from "@/hooks/use-categories";
import {PageHeader} from "@/components/dashboard/page-header";
import {CategoryList} from "@/components/config/category-list";

export default function ConfigPage() {
    const {data: adminData, isLoading: loadingAdmin} = useAdminCategories();
    const {data: mainCatsData, isLoading: loadingMain} = useMainCategories();

    const categories = adminData?.data ?? [];
    const mainCategories = mainCatsData?.data ?? [];

    return (
        <div>
            <PageHeader title="Config" description="Manage expense categories"/>
            <div className="p-4 max-w-2xl space-y-4">
                <div className="rounded-lg border bg-card p-4">
                    <h2 className="text-sm font-semibold mb-3">Categories</h2>
                    <CategoryList
                        categories={categories}
                        mainCategories={mainCategories}
                        isLoading={loadingAdmin || loadingMain}
                    />
                </div>
            </div>
        </div>
    );
}
