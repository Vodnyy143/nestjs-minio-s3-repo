export interface MinioBucketConfig {
  name: string;
  policy?: 'public' | 'private' | 'custom';
  customPolicy?: any;
}

export interface MinioBucketConfigPolicyStatement {
  Effect: 'Allow' | 'Deny';
  Principal: { AWS: string[] };
  Action: string[];
  Resource: string[];
}
