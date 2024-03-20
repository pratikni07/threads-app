'use server';

import { revalidatePath } from 'next/cache';
import User from '../models/User.model';
import { connectToDB } from '../mongoose';
import Thread from '../models/thread.model';
import { FilterQuery, SortOrder } from 'mongoose';

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export const updateUser = async ({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: Params): Promise<void> => {
  connectToDB();

  try {
    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      {
        upsert: true,
      }
    );

    if (path === '/profile/edit') {
      revalidatePath(path);
    }
  } catch (error: any) {
    console.log(error);
    throw new Error(`Failed to create/update user's profile: ${error.message}`);
  }
};

export const fetchUser = async (userId: string) => {
  try {
    connectToDB();

    return await User.findOne({ id: userId });
    // .populate({
    //   path: 'communities',
    //   model: Community,
    // });
  } catch (error: any) {
    console.log(error);
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
};

export const fetchUserThreads = async (userId: string) => {
  try {
    connectToDB();
    const threads = await User.findOne({ id: userId }).populate({
      path: 'threads',
      model: Thread,
      populate: {
        path: 'children',
        model: Thread,
        populate: {
          path: 'author',
          model: User,
          select: 'name image id',
        },
      },
    });

    return threads;
  } catch (error: any) {
    console.log(error);
    throw new Error(`Failed to fetch user threads: ${error.message}`);
  }
};

export const fetchUsersForSearch = async ({
  userId,
  searchString = '',
  pageNumber = 1,
  pageSize = 10,
  sortBy = 'desc',
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) => {
  try {
    connectToDB();

    const skips = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchString, 'i');

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    };

    if (searchString !== '') {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions = {
      createdAt: sortBy,
    };

    const userQuery = User.find(query)
      .sort(sortOptions)
      .skip(skips)
      .limit(pageSize);

    const totalUserCount = await User.countDocuments(query);

    const users = await userQuery.exec();

    const isNext = totalUserCount > skips + users.length;

    return { users, isNext };
  } catch (error: any) {
    console.log(error);
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
};

export const getActivity = async (userId: string) => {
  try {
    connectToDB();

    //find all threads created by user
    const userThreads = await Thread.find({ author: userId });

    //collect the children ids from the threads
    const childrenThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    // all the replies except the one created by the user
    const replies = await Thread.find({
      _id: { $in: childrenThreadIds },
      author: { $ne: userId },
    }).populate({
      path: 'author',
      model: User,
      select: 'name image _id',
    });

    return replies;
  } catch (error: any) {
    throw new Error(`Failed to fetch user activity: ${error.message}`);
  }
};
