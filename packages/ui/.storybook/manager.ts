import { addons } from 'storybook/manager-api';
import { kompasTheme } from './theme';

addons.setConfig({ theme: kompasTheme, sidebar: { showRoots: true } });
