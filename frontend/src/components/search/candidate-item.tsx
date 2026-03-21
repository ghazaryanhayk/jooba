import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '../ui/item';
import { Link } from 'react-router-dom';

export interface Candidate {
  name: string;
  title: string;
  company: string;
  bio: string;
  avatarUrl?: string;
}

export function CandidateItem({ name, title, company, bio, avatarUrl }: Candidate) {
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
          <Avatar className="size-9 shrink-0">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{name}</ItemTitle>
          <ItemDescription className="text-xs">{title}, {company}</ItemDescription>
          <ItemDescription className="text-xs">{bio}</ItemDescription>
        </ItemContent>
      </Link>
    </Item>
  );
}
