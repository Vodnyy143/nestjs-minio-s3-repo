import { Inject } from '@nestjs/common';
import { MINIO_BUCKET_TOKEN } from '../constants';

export const InjectBucket = () => Inject(MINIO_BUCKET_TOKEN);
