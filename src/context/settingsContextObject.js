import { createContext } from "react";

// Context object separated into its own module so other modules can
// export only components or only non-components, which plays nicer
// with React Fast Refresh/HMR.
export const SettingsContext = createContext();
