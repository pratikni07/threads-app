import AccountProfile from '@/components/forms/AccountProfile';
import { currentUser } from '@clerk/nextjs';
import React from 'react';

export default async function Page() {
  const user = await currentUser();

  const userInfo = { _id: '', username: '', name: '', bio: '', image: '' };

  const userData = {
    id: user?.id as string,
    objectId: userInfo?._id,
    username: userInfo?.username || (user?.username as string),
    name: userInfo?.name || (user?.firstName as string),
    bio: userInfo?.bio || '',
    image: userInfo?.image || (user?.imageUrl as string),
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20">
      <h1 className="head-text">OnBoarding</h1>
      <p className="mt-3 text-base-regular text-light-2">
        Complete your profile now to use Threads
      </p>
      <section className="mt-9 bg-dark-2 p-10">
        <AccountProfile user={userData} btnTitle="Continue" />
      </section>
    </main>
  );
}
