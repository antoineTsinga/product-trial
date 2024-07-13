import { SidenavItem } from "app/base/sidenav/sidenav.model";

export const SIDENAV_ITEMS: SidenavItem[] = [
  {
    id: "products",
    labels: {
      en: "Products",
      fr: "Produits",
    },
    link: "products",
  },
  {
    id: "admin/products",
    labels: {
      en: "Admin",
      fr: "Admin",
    },
    link: "admin/products",
  },
];
