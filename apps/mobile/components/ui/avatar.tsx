import { cn } from '@/lib/utils';
import { resolvePublicFileUrl } from '@/lib/public-file-url';
import * as AvatarPrimitive from '@rn-primitives/avatar';

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  source,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  const resolvedSource =
    source && typeof source === 'object' && !Array.isArray(source) && 'uri' in source && typeof source.uri === 'string'
      ? { ...source, uri: resolvePublicFileUrl(source.uri) ?? source.uri }
      : source;

  return <AvatarPrimitive.Image className={cn('aspect-square size-full', className)} source={resolvedSource} {...props} />;
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        'bg-muted flex size-full flex-row items-center justify-center rounded-full',
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarFallback, AvatarImage };
