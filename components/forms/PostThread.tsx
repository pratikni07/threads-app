'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { usePathname, useRouter } from 'next/navigation';
import { ThreadValidation } from '@/lib/validations/thread';
import { createThread } from '@/lib/actions/thread.actions';
// import { updateUser } from '@/lib/actions/user.actions';

interface Props {
  user: {
    id: string;
    objectId: string;
    name: string;
    bio: string;
    image: string;
    username: string;
  };
  btnTitle: string;
}

type PostThreadParams = {
  userId: string;
};

export default function PostThread({ userId }: PostThreadParams) {
  const pathname = usePathname();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      thread: '',
      accountId: userId,
    },
  });

  const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
    await createThread({
      text: values.thread,
      author: userId,
      communityId: null,
      path: pathname,
    });

    router.push('/');
  };

  return (
    <Form {...form}>
      <form
        className="mt-10 flex flex-col justify-start gap-10"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Content
              </FormLabel>
              <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                <Textarea
                  rows={15}
                  className="account-form_input no-focus"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="bg-primary-500">
          Post Thread
        </Button>
      </form>
    </Form>
  );
}
