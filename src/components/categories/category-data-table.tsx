"use client";

import {useMemo, useState} from "react";
import {
    ColumnDef,
    ExpandedState,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {ChevronDown, ChevronRight, MoreHorizontal, Pencil, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Switch} from "@/components/ui/switch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {CategoryIcon} from "@/components/ui/category-icon";

export interface CategoryRow {
    id: number;
    name: string;
    icon: string | null;
    color: string | null;
    isMain: boolean;
    isActive: boolean;
    subRows?: CategoryRow[];
}

interface CategoryDataTableProps {
    readonly data: CategoryRow[];
    readonly onEdit?: (row: CategoryRow) => void;
    readonly onDelete?: (row: CategoryRow) => void;
    readonly onToggleActive?: (row: CategoryRow, active: boolean) => void;
}

export function CategoryDataTable({data, onEdit, onDelete, onToggleActive}: CategoryDataTableProps) {
    const [expanded, setExpanded] = useState<ExpandedState>({});

    const columns = useMemo<ColumnDef<CategoryRow>[]>(() => [
        {
            id: "expander",
            header: () => null,
            cell: ({row}) => {
                if (!row.getCanExpand()) return <span className="inline-block w-6"/>;
                return (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={row.getToggleExpandedHandler()}
                        aria-label={row.getIsExpanded() ? "Collapse subcategories" : "Expand subcategories"}
                    >
                        {row.getIsExpanded()
                            ? <ChevronDown className="h-4 w-4"/>
                            : <ChevronRight className="h-4 w-4"/>
                        }
                    </Button>
                );
            },
            size: 48,
        },
        {
            id: "icon",
            header: "Icon",
            cell: ({row}) => {
                const {icon, color, isMain} = row.original;
                if (!icon) return <span className="text-muted-foreground text-sm">—</span>;
                const bg = color ?? "#e5e7eb";
                return isMain ? (
                    <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{backgroundColor: bg}}
                    >
                        <CategoryIcon iconName={icon} className="h-4 w-4 text-white"/>
                    </div>
                ) : (
                    <div
                        className="h-6 w-6 rounded flex items-center justify-center shrink-0 ml-1"
                        style={{backgroundColor: bg + "33"}}
                    >
                        <CategoryIcon iconName={icon} className="h-3.5 w-3.5" color={bg}/>
                    </div>
                );
            },
            size: 64,
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({row}) => (
                <span className={row.original.isMain ? "font-medium" : "text-muted-foreground text-sm"}>
                    {row.original.name}
                </span>
            ),
        },
        {
            id: "type",
            header: "Type",
            cell: ({row}) =>
                row.original.isMain
                    ? <Badge variant="secondary">Main</Badge>
                    : <Badge variant="outline" className="text-muted-foreground">Sub</Badge>,
            size: 80,
        },
        {
            id: "subcategories",
            header: "Subcategories",
            cell: ({row}) => {
                if (!row.original.isMain) return null;
                const count = row.original.subRows?.length ?? 0;
                return (
                    <span className="text-sm text-muted-foreground tabular-nums">
                        {count > 0 ? count : "—"}
                    </span>
                );
            },
            size: 120,
        },
        {
            id: "status",
            header: "Active",
            cell: ({row}) => (
                <Switch
                    checked={row.original.isActive}
                    onCheckedChange={(checked) => onToggleActive?.(row.original, checked)}
                    aria-label={`${row.original.isActive ? "Deactivate" : "Activate"} ${row.original.name}`}
                />
            ),
            size: 80,
        },
        {
            id: "actions",
            header: () => null,
            cell: ({row}) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Category actions">
                            <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit?.(row.original)}>
                            <Pencil className="mr-2 h-4 w-4"/>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem
                            onClick={() => onDelete?.(row.original)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4"/>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            size: 52,
        },
    ], [onEdit, onDelete, onToggleActive]);

    const table = useReactTable({
        data,
        columns,
        state: {expanded},
        onExpandedChange: setExpanded,
        getSubRows: (row) => row.subRows,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    });

    return (
        <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} style={{width: header.column.getSize()}}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                        ))}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            className={row.depth > 0 ? "bg-muted/30" : undefined}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} style={{width: cell.column.getSize()}}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                            No categories found.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
