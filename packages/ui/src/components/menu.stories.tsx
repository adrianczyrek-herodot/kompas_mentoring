import type { Meta, StoryObj } from '@storybook/react-vite';
import { LogOut, MoreHorizontal, Repeat, UserRound } from 'lucide-react';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { Avatar, AvatarFallback } from './avatar';
import { Button } from './button';
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuLinkItem,
  MenuSeparator,
  MenuTrigger,
} from './menu';

const framed = { docs: { story: { inline: false, height: '360px' } } };

function AccountMenu({ defaultOpen = false, onSignOut }: { defaultOpen?: boolean; onSignOut?: () => void }) {
  return (
    <div className="flex justify-end">
      <Menu defaultOpen={defaultOpen}>
        <MenuTrigger render={<Button variant="ghost" />}>
          <Avatar size="sm" aria-hidden="true">
            <AvatarFallback>AK</AvatarFallback>
          </Avatar>
          <span className="sr-only">Konto: Anna</span>
        </MenuTrigger>
        <MenuContent>
          <MenuLinkItem href="#konto">
            <UserRound aria-hidden="true" />
            Konto i ustawienia
          </MenuLinkItem>
          <MenuItem>
            <Repeat aria-hidden="true" />
            Przełącz na widok mentora
          </MenuItem>
          <MenuSeparator />
          <MenuItem onClick={onSignOut}>
            <LogOut aria-hidden="true" />
            Wyloguj
          </MenuItem>
        </MenuContent>
      </Menu>
    </div>
  );
}

type Args = { onSignOut: () => void };

const meta = {
  title: 'Komponenty bazowe/Nakładki/Menu',
  args: { onSignOut: fn() },
  render: ({ onSignOut }) => <AccountMenu onSignOut={onSignOut} />,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Odmiany: menu konta i akcje wiersza',
  parameters: framed,
  render: () => (
    <Menu defaultOpen>
      <MenuTrigger
        render={<Button variant="ghost" size="icon-sm" />}
        aria-label="Więcej akcji dla wniosku Anny Kowalczyk"
      >
        <MoreHorizontal aria-hidden="true" />
      </MenuTrigger>
      <MenuContent align="start">
        <MenuGroup>
          <MenuGroupLabel>Wniosek</MenuGroupLabel>
          <MenuItem>Otwórz wniosek</MenuItem>
          <MenuItem>Poproś o zmiany</MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem destructive>Odrzuć wniosek…</MenuItem>
        <MenuItem disabled>Zatwierdź (najpierw checklista)</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

export const States: Story = {
  name: 'Macierz stanów: otwarte menu',
  parameters: {
    ...framed,
    docs: {
      ...framed.docs,
      description: {
        story: 'Podświetlona pozycja (strzałki, najechanie) — `surface-hover`; zablokowana — `text-disabled` z powodem w nazwie.',
      },
    },
  },
  render: () => <AccountMenu defaultOpen />,
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  parameters: framed,
  globals: { viewport: { value: 'mobile320', isRotated: false } },
  render: () => (
    <Menu defaultOpen>
      <MenuTrigger render={<Button variant="outline" />}>Akcje</MenuTrigger>
      <MenuContent align="start">
        <MenuItem>Poproś o zmiany w opisie i zdjęciu profilu</MenuItem>
        <MenuItem destructive>Odrzuć wniosek Katarzyny Wiśniewskiej-Zalewskiej…</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

export const KeyboardSelect: Story = {
  name: 'Test: strzałki, Escape, powrót fokusu i wybór',
  play: async ({ args, canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Konto: Anna' });
    await userEvent.click(trigger);
    const menu = await screen.findByRole('menu');
    await waitFor(() => expect(menu).toContainElement(document.activeElement as HTMLElement));
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Konto i ustawienia' })).toHaveAttribute(
        'data-highlighted',
      ),
    );
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Przełącz na widok mentora' })).toHaveAttribute(
        'data-highlighted',
      ),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Wyloguj' }));
    await expect(args.onSignOut).toHaveBeenCalledTimes(1);
  },
};
