// Runs dependency-cruiser through its API (spec §2.4: cycles and module privacy).
// The CLI refuses odd Node releases (e.g. 25); the API works on every Node >= 24.
import { cruise, format } from 'dependency-cruiser';
import extractDepcruiseOptions from 'dependency-cruiser/config-utl/extract-depcruise-options';
import extractTSConfig from 'dependency-cruiser/config-utl/extract-ts-config';

const options = await extractDepcruiseOptions('./.dependency-cruiser.cjs');
const tsConfig = extractTSConfig(options.tsConfig.fileName);

const result = await cruise(
  ['apps', 'packages'],
  { ...options, validate: true },
  options.enhancedResolveOptions,
  { tsConfig },
);
const report = await format(result.output, { outputType: 'err' });
process.stdout.write(report.output);
process.exitCode = report.exitCode;
