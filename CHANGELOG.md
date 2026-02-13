# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-25

### Added
- Initial release
- `MinioModule` with `forRoot()` and `forRootAsync()` methods
- `MinioService` with core S3-compatible operations:
  - `upload()` - Upload files to MinIO/S3
  - `delete()` - Delete files from MinIO/S3
  - `get()` - Retrieve files from MinIO/S3
  - `list()` - List objects in a bucket
  - `getPublicUrl()` - Generate public URLs for objects
  - `getKeyFromUrl()` - Extract object key from URL
  - `getClient()` - Access underlying S3Client
- Automatic bucket creation and policy management on module initialization
- Support for public and private bucket policies
- Custom bucket policy support
- AWS SDK v3 integration (@aws-sdk/client-s3)
- TypeScript support with full type definitions
- Global module decorator for easy import across application

### Features
- Synchronous configuration via `forRoot()`
- Asynchronous configuration via `forRootAsync()` with support for:
  - `useFactory`
  - `useClass`
  - `useExisting`
- Multiple bucket configuration
- Configurable region support (defaults to 'us-east-1')
- Path-style bucket access (required for MinIO)
- Comprehensive error logging

## [1.0.1] - 2026-02-12

### Changed
- Updated peer dependencies in `package.json` to support all NestJS versions (^8.0.0 || ^9.0.0 || ^10.0.0)
- Improved compatibility with different NestJS project versions

## [1.1.0] - 2026-02-13

### Changed
- **BREAKING CHANGE**: Replaced single `endpoint` option with separate `host`, `port`, and `useSsl` options in `MinioModuleOptions`
    - Before: `endpoint: 'http://localhost:9000'`
    - After: `host: 'localhost'`, `port: 9000`, `useSsl: false`
- Updated `MinioService` constructor to build endpoint from `host`, `port`, and `useSsl`
- Simplified `getPublicUrl()` method to use constructed endpoint

### Migration Guide
```typescript
// v1.0.x
MinioModule.forRoot({
  endpoint: 'http://localhost:9000',
  accessKey: 'minioadmin',
  secretKey: 'minioadmin',
})

// v1.1.0
MinioModule.forRoot({
  host: 'localhost',
  port: 9000,
  useSsl: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin',
})
```

## [2.0.0] - 2026-02-14


