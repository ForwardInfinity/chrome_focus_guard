// Shared TypeScript types for Chrome Focus Guard

/**
 * Manifest.json typings for Manifest V3
 */
export interface Manifest {
  manifest_version: 3;
  name: string;
  version: string;
  description?: string;
  background: {
    service_worker: string;
  };
  permissions: Array<'storage' | 'webRequest' | 'activeTab'>;
  host_permissions: string[];
}
