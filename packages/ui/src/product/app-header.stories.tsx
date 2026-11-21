import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Avatar, AvatarFallback } from '../components/avatar';
import { Button } from '../components/button';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '../components/menu';
import { AppHeader } from './app-header';

function AccountMenu({ initials }: { initials: string }) {
  return (
    <Menu>
      <MenuTrigger render={<Button variant="ghost" size="icon" />}>
        <Avatar size="sm" aria-hidden="true">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="sr-only">Menu konta</span>
      </MenuTrigger>
      <MenuContent align="end">
        <MenuItem>Konto i ustawienia</MenuItem>
        <MenuSeparator />
        <MenuItem>Wyloguj</MenuItem>
      </MenuContent>
    </Menu>
  );
}

const meta = {
  title: 'Produkt/Wspólne/AppHeader',
  component: AppHeader,
  args: { role: 'student', current: 'sessions', actions: <AccountMenu initials="AC" /> },
  argTypes: {
    role: { control: 'inline-radio', options: ['student', 'mentor'] },
    current: { control: 'text' },
    actions: { control: false },
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Mentor: Story = {
  name: 'Mentor',
  args: { role: 'mentor', current: 'dashboard', actions: <AccountMenu initials="KN" /> },
};

export const Mobile: Story = {
  name: 'Wąski ekran (dolny pasek)',
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  parameters: {
    docs: {
      description: {
        story:
          'Poniżej 768 px nawigacja przechodzi do dolnego paska (KONCEPCJA §3.2). Zobacz na stronie story z wąskim viewportem.',
      },
    },
  },
};

export const CurrentPageTest: Story = {
  name: 'Test: bieżąca sekcja ma aria-current, 5 pozycji',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'Główna' });
    const links = within(nav).getAllByRole('link');
    await expect(links).toHaveLength(5);
    await expect(within(nav).getByRole('link', { name: 'Sesje' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};
