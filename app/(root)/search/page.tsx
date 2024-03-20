import Image from 'next/image';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import { fetchUser, fetchUsersForSearch } from '@/lib/actions/user.actions';
import UserCard from '@/components/cards/UserCard';

export default async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect('/onboarding');

  //fetch Users
  const result = await fetchUsersForSearch({
    userId: user.id,
    searchString: '',
    pageNumber: 1,
    pageSize: 25,
  });
  return (
    <section className="">
      <h1 className="head-text mb-10">Search</h1>
      {/* SearchBar */}

      <div className="mt-14 flex flex-col gap-9">
        {result.users.length === 0 ? (
          <p className="no-result">No users found</p>
        ) : (
          <>
            {result.users.map((person) => (
              <UserCard
                key={person.id}
                id={person.id}
                name={person.name}
                username={person.username}
                bio={person.bio}
                image={person.image}
                personType="User"
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
}
