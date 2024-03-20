'use client';
import Image from 'next/image';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

type UserCardProps = {
  id: string;
  name: string;
  username: string;
  bio: string;
  image: string;
  personType: string;
};

export default function UserCard({
  id,
  name,
  username,
  bio,
  image,
  personType,
}: UserCardProps) {
  const router = useRouter();
  return (
    <article className="user-card">
      <div className="user-card_avatar">
        <Image
          src={image}
          alt={`${name}'s avatar`}
          width={48}
          height={48}
          className="rounded-full"
        />
        <div className="flex-1 text-ellipsis">
          <h4 className="text-base-semibold text-light-1">{name}</h4>
          <p className="text-small-medium text-gray-1">@{username}</p>
        </div>
      </div>

      <Button
        onClick={() => router.push(`/profile/${id}`)}
        className="user-card_btn"
      >
        View
      </Button>
    </article>
  );
}
