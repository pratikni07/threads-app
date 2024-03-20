'use server';

import { revalidatePath } from 'next/cache';
import User from '../models/User.model';
import Thread from '../models/thread.model';
import { connectToDB } from '../mongoose';
import { threadId } from 'worker_threads';

type ThreadParams = {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
};

export const createThread = async ({
  text,
  author,
  communityId,
  path,
}: ThreadParams) => {
  try {
    connectToDB();

    //create thread
    const createdThread = await Thread.create({
      text,
      author,
      communityId: null,
    });

    //update user model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    console.log(error);
    throw new Error(`Error creating thread: ${error.message}`);
  }

  //update community model
};

export const fetchThreads = async (pageNumber = 1, pageSize = 20) => {
  connectToDB();

  //calculate the skips
  const skips = pageSize * (pageNumber - 1);

  //fetch the threads that have no parents

  const postQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({
      createdAt: 'desc',
    })
    .skip(skips)
    .limit(pageSize)
    .populate({
      path: 'author',
      model: User,
    })
    .populate({
      path: 'children',
      populate: {
        path: 'author',
        model: User,
        select: '_id name parentId image',
      },
    });

  const totalPostCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  });

  const posts = await postQuery.exec();

  const isNext = totalPostCount > skips + posts.length;

  return { posts, isNext };
};

export const fetchThreadById = async (threadId: string) => {
  connectToDB();

  try {
    const thread = await Thread.findById(threadId)
      .populate({
        path: 'author',
        model: User,
        select: '_id id name image',
      })
      .populate({
        path: 'children',
        populate: [
          {
            path: 'author',
            model: User,
            select: '_id name parentId image',
          },
          {
            path: 'children',
            model: Thread,
            populate: {
              path: 'author',
              model: User,
              select: '_id name parentId image',
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (error: any) {
    console.log(error);
    throw new Error(`Error fetching thread: ${error.message}`);
  }
};

export const addCommentToThread = async (
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) => {
  connectToDB();

  try {
    //add a comment to the thread

    //step - 1 : find the original thread
    const originalThread = await Thread.findById(threadId);
    if (!originalThread) throw new Error('Thread not found');

    //step - 2 : create a new thread with the comment text
    const commentThread = await new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });
    const savedCommentThread = await commentThread.save();

    //step - 3 : update the original thread with the comment thread
    await originalThread.children.push(savedCommentThread._id);
    await originalThread.save();

    //last  : revalidate the path
    //function of revalidate path is to update the cache of the path
    revalidatePath(path);
  } catch (error: any) {
    console.log(error);
    throw new Error(`Error adding comment to thread: ${error.message}`);
  }
};
