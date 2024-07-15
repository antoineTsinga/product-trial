import { ControlType } from "app/shared/utils/crud-item-options/control-type.model";
import { CrudItemOptions } from "app/shared/utils/crud-item-options/crud-item-options.model";
import { ScreenWidth } from "app/shared/utils/crud-item-options/screen-width.model";
import { SelectItem } from "primeng/api";

export const categoryOptions: SelectItem[] = [
  { label: "Accessories", value: "Accessories" },
  { label: "Fitness", value: "Fitness" },
  { label: "Clothing", value: "Clothing" },
  { label: "Electronics", value: "Electronics" },
];
export const inventoryStatusOptions: SelectItem[] = [
  { label: "In Stock", value: "INSTOCK" },
  { label: "Low Stock", value: "LOWSTOCK" },
  { label: "Out of Stock", value: "OUTOFSTOCK" },
];

const large = [ScreenWidth.large];
const medium = [ScreenWidth.large, ScreenWidth.medium];
const small = [ScreenWidth.small, ScreenWidth.medium, ScreenWidth.large];

export const getColumnAdmin = (screenWidth: ScreenWidth): CrudItemOptions[] => {
  return [
    {
      key: "id",
      label: "Id",
      controlType: ControlType.INPUT,
      type: "text",
      columnOptions: {
        default: false,
        sortable: true,
        filterable: true,
      },
      controlOptions: { disableOnCreate: true, hideOnCreate: true },
    },
    {
      key: "code",
      label: "Code",
      controlType: ControlType.INPUT,
      type: "text",
      columnOptions: {
        default: small.includes(screenWidth),
        sortable: true,
        filterable: true,
      },
    },
    {
      key: "name",
      label: "Name",
      controlType: ControlType.INPUT,
      type: "text",
      columnOptions: {
        default: small.includes(screenWidth),
        sortable: true,
        filterable: true,
      },
    },
    {
      key: "description",
      label: "Description",
      controlType: ControlType.INPUT,
      type: "text",
      columnOptions: { default: false, sortable: true, filterable: true },
    },

    {
      key: "category",
      label: "Category",
      controlType: ControlType.SELECT,
      options: categoryOptions,
      type: "text",
      columnOptions: {
        default: large.includes(screenWidth),
        sortable: true,
        filterable: true,
      },
    },
    {
      key: "quantity",
      label: "Quantity",
      controlType: ControlType.NUMBER,
      type: "number",
      columnOptions: {
        default: medium.includes(screenWidth),
        sortable: true,
        filterable: true,
      },
    },
    {
      key: "inventoryStatus",
      label: "Inventory Status",
      controlType: ControlType.SELECT,
      options: inventoryStatusOptions,
      type: "text",
      columnOptions: {
        default: large.includes(screenWidth),
        sortable: true,
        filterable: true,
      },
    },
    {
      key: "rating",
      label: "Rating",
      controlType: ControlType.NUMBER,
      type: "number",
      columnOptions: {
        default: large.includes(screenWidth),
        sortable: true,
        filterable: true,
      },
    },
  ];
};

export const changeColRender = (key: string) => {};
