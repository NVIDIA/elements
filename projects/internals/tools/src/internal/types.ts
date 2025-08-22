export interface ReportCheck {
  message: string;
  status: 'success' | 'danger' | 'info' | 'warning';
}

export interface Report {
  [key: string]: ReportCheck;
}

export interface PackageData {
  devDependencies: Record<string, string>;
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
}
