import { useRender } from '@base-ui/react/use-render';
import { cn } from '../lib/utils';

type LinkProps = useRender.ComponentProps<'a'>;

/**
 * Navigation to another page or place (R04.2: accent colour for links). Always underlined, so the
 * link is not marked by colour alone (WCAG 1.4.1). Pass `render={<NextLink href="…" />}` in apps.
 */
function Link({ className, render, ...props }: LinkProps) {
  return useRender({
    defaultTagName: 'a',
    render,
    props: {
      'data-slot': 'link',
      className: cn(
        'rounded-tag text-text-link underline underline-offset-4 transition-colors duration-fast hover:decoration-2',
        className,
      ),
      ...props,
    },
  });
}

export { Link, type LinkProps };
