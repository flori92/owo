declare module 'react-native-web-refresh-control' {
  import { ComponentType } from 'react';
  import { ViewProps } from 'react-native';
  
  interface RefreshControlProps extends ViewProps {
    refreshing?: boolean;
    onRefresh?: () => void;
    tintColor?: string;
    colors?: string[];
    progressBackgroundColor?: string;
    size?: number;
    progressViewOffset?: number;
  }
  
  const RefreshControl: ComponentType<RefreshControlProps>;
  export default RefreshControl;
}
