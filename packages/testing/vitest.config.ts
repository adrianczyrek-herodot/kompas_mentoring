import { unitTestInclude, vitestPreset } from '@kompas/config/vitest';
import { defineConfig } from 'vitest/config';

export default defineConfig({ test: { ...vitestPreset, include: unitTestInclude } });
