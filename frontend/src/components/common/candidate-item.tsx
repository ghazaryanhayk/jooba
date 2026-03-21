import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export type Tier = 'A' | 'B' | 'C' | 'D' | 'F';

const tierColors: Record<Tier, string> = {
  A: 'bg-green-700',
  B: 'bg-blue-700',
  C: 'bg-yellow-700',
  D: 'bg-orange-700',
  F: 'bg-red-700',
};

export type CandidateProps = {
  name: string;
  title: string;
  company: string;
  bio: string;
  avatarUrl?: string;
  tier?: Tier;
  status?: {
    approved: boolean;
    reason: string;
  };
}

export function CandidateItem({ name, title, company, bio, avatarUrl, tier, status }: CandidateProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Item asChild>
      <Link to="#">
        <ItemMedia>
          <div className="relative">
            <Avatar className="size-9 shrink-0">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            {tier && (
              <div
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 size-4 rounded-full text-[10px] flex items-center justify-center text-white font-medium border-2 border-white box-content line-height-1',
                  tierColors[tier]
                )}
              >
                {tier}
              </div>
            )}

          </div>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{name}</ItemTitle>
          <ItemDescription className="text-xs">{title}, {company}</ItemDescription>
          <ItemDescription className="text-xs">{bio}</ItemDescription>
          {status && (
            <ItemDescription className={cn('text-xs', status.approved ? 'text-green-900' : 'text-red-900')}>
              {status.reason}
            </ItemDescription>
          )}
        </ItemContent>
      </Link>
    </Item>
  );
}
