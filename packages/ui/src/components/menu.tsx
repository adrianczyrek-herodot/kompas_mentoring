'use client';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { groupLabelClasses, listItemClasses, popupClasses, positionerClasses } from '../lib/overlay';
import { cn } from '../lib/utils';

// List of actions (account menu, row actions in A1). Items 44 px (K1), highlight surface-hover (D4).
const Menu = MenuPrimitive.Root;
const MenuTrigger = MenuPrimitive.Trigger;
const MenuGroup = MenuPrimitive.Group;

function MenuContent({
  className,
  children,
  sideOffset = 4,
  align = 'end',
  ...props
}: MenuPrimitive.Popup.Props & { sideOffset?: number; align?: 'start' | 'center' | 'end' }) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner className={positionerClasses} sideOffset={sideOffset} align={align}>
        <MenuPrimitive.Popup
          data-slot="menu-content"
          className={cn(popupClasses, className)}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function MenuItem({
  className,
  destructive = false,
  ...props
}: MenuPrimitive.Item.Props & {
  /** Irreversible action ("Odrzuć wniosek"): danger text; still confirmed with AlertDialog. */
  destructive?: boolean;
}) {
  return (
    <MenuPrimitive.Item
      data-slot="menu-item"
      className={cn(
        listItemClasses,
        '[&_svg]:size-icon-sm [&_svg]:shrink-0',
        destructive && 'text-status-danger-fg',
        className,
      )}
      {...props}
    />
  );
}

function MenuLinkItem({ className, ...props }: MenuPrimitive.LinkItem.Props) {
  return (
    <MenuPrimitive.LinkItem
      data-slot="menu-link-item"
      className={cn(listItemClasses, '[&_svg]:size-icon-sm [&_svg]:shrink-0', className)}
      {...props}
    />
  );
}

function MenuGroupLabel({ className, ...props }: MenuPrimitive.GroupLabel.Props) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="menu-group-label"
      className={cn(groupLabelClasses, className)}
      {...props}
    />
  );
}

function MenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="menu-separator"
      className={cn('my-tight h-px bg-border-divider', className)}
      {...props}
    />
  );
}

export {
  Menu,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuLinkItem,
  MenuSeparator,
  MenuTrigger,
};
