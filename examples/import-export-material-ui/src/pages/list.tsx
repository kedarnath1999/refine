import React from "react";
import {
  useExport,
  useImport,
  useMany,
  useNotification,
} from "@refinedev/core";
import { ExportButton, ImportButton, List, useDataGrid } from "@refinedev/mui";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import Stack from "@mui/material/Stack";

import { ICategory, IPost } from "../interfaces";

export const ImportList: React.FC = () => {
  const { dataGridProps } = useDataGrid<IPost>();

  const { data: categoryData, isLoading: categoryIsLoading } =
    useMany<ICategory>({
      resource: "categories",
      ids: dataGridProps?.rows?.map((item) => item?.category?.id) ?? [],
      queryOptions: {
        enabled: !!dataGridProps?.rows,
      },
    });

  const { open } = useNotification();

  const { inputProps, isLoading } = useImport({
    onFinish: () => {
      open?.({
        message: "Import successfully completed",
        type: "success",
      });
    },
  });

  const { triggerExport, isLoading: exportLoading } = useExport<IPost>({
    mapData: (item) => {
      return {
        title: item.title,
        content: item.content,
        status: item.status,
        categoryId: item.category.id,
      };
    },
    maxItemCount: 50,
  });

  const columns = React.useMemo<GridColDef<any>[]>(
    () => [
      {
        field: "id",
        headerName: "ID",
        type: "number",
      },
      { field: "title", headerName: "Title", flex: 1.5, minWidth: 350 },
      {
        field: "category",
        headerName: "Category",
        valueGetter: ({ row }) => {
          const value = row?.category?.id;

          return value;
        },
        minWidth: 300,
        renderCell: function render({ value }) {
          return categoryIsLoading ? (
            <>Loading...</>
          ) : (
            categoryData?.data?.find((item) => item.id === value)?.title
          );
        },
      },
      { field: "status", headerName: "Status", flex: 1 },
    ],
    [categoryData?.data],
  );

  return (
    <List
      headerProps={{
        action: (
          <Stack direction="row">
            <ImportButton loading={isLoading} inputProps={inputProps} />
            <ExportButton loading={exportLoading} onClick={triggerExport} />
          </Stack>
        ),
      }}
    >
      <div style={{ height: 700, width: "100%" }}>
        <DataGrid {...dataGridProps} columns={columns} />
      </div>
    </List>
  );
};
