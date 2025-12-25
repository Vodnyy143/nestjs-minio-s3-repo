import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import { MinioModuleOptions } from './interfaces/minio-options.interface';
import { MINIO_MODULE_OPTIONS } from './constants';
import { MinioBucketConfig } from './interfaces/minio-bucket-config.interface';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private s3Client: S3Client;

  constructor(
    @Inject(MINIO_MODULE_OPTIONS)
    private readonly options: MinioModuleOptions,
  ) {
    this.s3Client = new S3Client({
      endpoint: this.options.endpoint,
      region: this.options.region || 'us-east-1',
      credentials: {
        accessKeyId: this.options.accessKey,
        secretAccessKey: this.options.secretKey,
      },
      forcePathStyle: true,
    });
  }

  async onModuleInit() {
    if (this.options.buckets && this.options.buckets.length > 0) {
      await this.initializeBuckets(this.options.buckets);
    }
  }

  private async initializeBuckets(buckets: MinioBucketConfig[]) {
    for (const bucket of buckets) {
      await this.createBucketIfNotExists(bucket.name);
      await this.setBucketPolicy(bucket);
    }
  }

  private async createBucketIfNotExists(bucketName: string): Promise<void> {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      this.logger.log(`Bucket "${bucketName}" already exists`);
    } catch (err) {
      if (err.name === 'NotFound') {
        try {
          await this.s3Client.send(
            new CreateBucketCommand({ Bucket: bucketName }),
          );
          this.logger.log(`Bucket "${bucketName}" created successfully`);
        } catch (createErr) {
          this.logger.error(
            `Error creating bucket "${bucketName}":`,
            createErr,
          );
          throw createErr;
        }
      } else {
        this.logger.error(`Error checking bucket "${bucketName}":`, err);
        throw err;
      }
    }
  }

  private async setBucketPolicy(
    bucketConfig: MinioBucketConfig,
  ): Promise<void> {
    let policy: any;

    if (bucketConfig.customPolicy) {
      policy = bucketConfig.customPolicy;
    } else if (bucketConfig.policy === 'public') {
      policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketConfig.name}/*`],
          },
        ],
      };
    } else if (bucketConfig.policy === 'private') {
      return;
    }

    if (policy) {
      try {
        await this.s3Client.send(
          new PutBucketPolicyCommand({
            Bucket: bucketConfig.name,
            Policy: JSON.stringify(policy),
          }),
        );
        this.logger.log(`Policy set for bucket "${bucketConfig.name}"`);
      } catch (err) {
        this.logger.error(
          `Error setting policy for bucket "${bucketConfig.name}":`,
          err,
        );
      }
    }
  }

  async upload(
    bucketName: string,
    key: string,
    body: Buffer,
    contentType?: string,
  ): Promise<string> {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      );

      return this.getPublicUrl(bucketName, key);
    } catch (err) {
      this.logger.error(`Error uploading file to ${bucketName}/${key}: `, err);
      throw err;
    }
  }

  async delete(bucketName: string, key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        }),
      );

      this.logger.log(`Deleted ${bucketName}/${key}`);
    } catch (err) {
      this.logger.error(`Error deleting file ${bucketName}/${key}: `, err);
      throw err;
    }
  }

  async get(bucketName: string, key: string): Promise<Buffer> {
    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        }),
      );

      return Buffer.from(await response.Body.transformToByteArray());
    } catch (err) {
      this.logger.error(`Error getting file ${bucketName}/${key}: `, err);
      throw err;
    }
  }

  async list(bucketName: string, prefix?: string): Promise<string[]> {
    try {
      const response = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: prefix,
        }),
      );

      return response.Contents.map((item) => item.Key) || [];
    } catch (err) {
      this.logger.error(`Error listing files in ${bucketName}: `, err);
      throw err;
    }
  }

  getPublicUrl(bucketName: string, key: string): string {
    const url = new URL(this.options.endpoint);

    url.pathname = `/${bucketName}/${key}`;

    return url.toString();
  }

  getKeyFromUrl(url: string, bucketName: string): string | null {
    const parts = url.split(`/${bucketName}/`);
    return parts.length > 1 ? parts[1] : null;
  }

  getClient(): S3Client {
    return this.s3Client;
  }
}
