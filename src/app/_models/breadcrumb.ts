export interface Breadcrumb {
    heading: string;
    links: BreadcrumbLink[];
}

export interface BreadcrumbLink {
    link: string;
    text: string;
}
