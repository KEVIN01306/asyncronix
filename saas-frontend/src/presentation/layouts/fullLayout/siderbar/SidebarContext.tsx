import React from 'react';

export interface SidebarContextValue {
    openGroups: string[];
    toggleGroup: (module?: string) => void;
    setGroupOpen: (module: string, value: boolean) => void;
    closeAllGroups: () => void;
    collapsed: boolean;
    drawerOpen: boolean;
    isMobile: boolean;
    hoverGroup: string | null;
    setHoverGroup: (module: string | null) => void;
    openSidebar?: () => void;
}

export const SidebarContext = React.createContext<SidebarContextValue>({
    openGroups: [],
    toggleGroup: () => { },
    setGroupOpen: () => { },
    closeAllGroups: () => { },
    collapsed: false,
    drawerOpen: false,
    isMobile: false,
    hoverGroup: null,
    setHoverGroup: () => { },
    openSidebar: undefined,
});
