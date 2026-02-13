import { MinioBucketConfig } from './minio-bucket-config.interface';
import {  Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';

export interface MinioModuleOptions {
  host: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  region?: string;
  buckets?: MinioBucketConfig[];
}

export interface MinioOptionsFactory {
  createMinioOptions(): Promise<MinioModuleOptions> | MinioModuleOptions;
}

export interface MinioModuleAsyncOptions extends Pick<
  ModuleMetadata,
  'imports'
> {
  useExisting?: Type<MinioOptionsFactory>;
  useClass?: Type<MinioOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<MinioModuleOptions> | MinioModuleOptions;
  inject?: any[];
}
