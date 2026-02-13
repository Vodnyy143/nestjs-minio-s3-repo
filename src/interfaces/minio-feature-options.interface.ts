export interface MinioFeatureOptions {
  bucketName: string;
  policy?: 'public' | 'private' | 'custom';
  customPolicy?: any;
}