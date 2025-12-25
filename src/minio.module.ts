import { DynamicModule, Global, Module, Provider } from '@nestjs/common';

import { MinioService } from './minio.service';
import {
  MinioModuleAsyncOptions,
  MinioModuleOptions,
  MinioOptionsFactory,
} from './interfaces/minio-options.interface';
import { MINIO_MODULE_OPTIONS } from './constants';

@Global()
@Module({})
export class MinioModule {
  static forRoot(options: MinioModuleOptions): DynamicModule {
    return {
      module: MinioModule,
      providers: [
        {
          provide: MINIO_MODULE_OPTIONS,
          useValue: options,
        },
        MinioService,
      ],
      exports: [MinioService],
    };
  }

  static forRootAsync(options: MinioModuleAsyncOptions): DynamicModule {
    return {
      module: MinioModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), MinioService],
      exports: [MinioService],
    };
  }

  private static createAsyncProviders(
    options: MinioModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: MinioModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: MINIO_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: MINIO_MODULE_OPTIONS,
      useFactory: async (optionsFactory: MinioOptionsFactory) =>
        await optionsFactory.createMinioOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
