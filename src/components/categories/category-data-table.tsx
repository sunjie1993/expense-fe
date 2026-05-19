"use client";

import {useRef, useState} from "react";
import {
    ColumnDef,
    ExpandedState,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {ChevronDown, ChevronRight, MoreHorizontal, Pencil, Plus, Trash2} from "lucide-react";
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
import {cn} from "@/lib/utils";

export interface CategoryRow {
    id: number;
    name: string;
    icon: string | null;
    color: string | null;
    isMain: boolean;
    isActive: boolean;
    parent_category_id: number | null;
    subRows?: CategoryRow[];
}

interface Callbacks {
    onEdit?: (row: CategoryRow) => void;
    onDelete?: (row: CategoryRow) => void;
    onToggleActive?: (row: CategoryRow, active: boolean) => void;
    onAddSub?: (parentId: number) => void;
}

interface CategoryDataTableProps extends Callbacks {
    readonly data: CategoryRow[];
    readonly processingId?: number | null;
}

const columns: ColumnDef<CategoryRow>[] = [
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
                    aria-label={row.getIsExpanded() ? "Collapse" : "Expand"}
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
            <span className={cn(
                row.original.isMain ? "font-medium" : "text-muted-foreground text-sm",
                !row.original.isActive && "line-through opacity-60",
            )}>
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
    {id: "__status", header: "Active", cell: () => null, size: 80},
    {id: "__actions", header: () => null, cell: () => null, size: 52},
];

function StatusCell({
    row,
    processingId,
    onToggleActive,
}: Readonly<{
    row: CategoryRow;
    processingId: number | null | undefined;
    onToggleActive?: (row: CategoryRow, active: boolean) => void;
}>) {
    return (
        <Switch
            checked={row.isActive}
            disabled={processingId === row.id}
            onCheckedChange={(checked) => onToggleActive?.(row, checked)}
            aria-label={`${row.isActive ? "Deactivate" : "Activate"} ${row.name}`}
        />
    );
}

function ActionsCell({
    row,
    onEdit,
    onDelete,
    onAddSub,
}: Readonly<{
    row: CategoryRow;
    onEdit?: (row: CategoryRow) => void;
    onDelete?: (row: CategoryRow) => void;
    onAddSub?: (parentId: number) => void;
}>) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Category actions">
                    <MoreHorizontal className="h-4 w-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(row)}>
                    <Pencil className="mr-2 h-4 w-4"/>
                    Edit
                </DropdownMenuItem>
                {row.isMain && (
                    <DropdownMenuItem onClick={() => onAddSub?.(row.id)}>
                        <Plus className="mr-2 h-4 w-4"/>
                        Add subcategory
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator/>
                <DropdownMenuItem
                    onClick={() => onDelete?.(row)}
                    className="text-destructive focus:text-destructive"
                >
                    <Trash2 className="mr-2 h-4 w-4"/>
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function CategoryDataTable({
    data,
    processingId,
    onEdit,
    onDelete,
    onToggleActive,
    onAddSub,
}: Readonly<CategoryDataTableProps>) {
    const [expanded, setExpanded] = useState<ExpandedState>({});

    const cbRef = useRef<Callbacks>({});
    cbRef.current = {onEdit, onDelete, onToggleActive, onAddSub};

    const processingIdRef = useRef(processingId);
    processingIdRef.current = processingId;

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
                            {row.getVisibleCells().map((cell) => {
                                if (cell.column.id === "__status") {
                                    return (
                                        <TableCell key={cell.id} style={{width: cell.column.getSize()}}>
                                            <StatusCell
                                                row={row.original}
                                                processingId={processingIdRef.current}
                                                onToggleActive={cbRef.current.onToggleActive}
                                            />
                                        </TableCell>
                                    );
                                }
                                if (cell.column.id === "__actions") {
                                    return (
                                        <TableCell key={cell.id} style={{width: cell.column.getSize()}}>
                                            <ActionsCell
                                                row={row.original}
                                                onEdit={cbRef.current.onEdit}
                                                onDelete={cbRef.current.onDelete}
                                                onAddSub={cbRef.current.onAddSub}
                                            />
                                        </TableCell>
                                    );
                                }
                                return (
                                    <TableCell key={cell.id} style={{width: cell.column.getSize()}}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                            No categories yet.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
