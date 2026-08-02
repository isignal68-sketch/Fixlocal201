'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Briefcase, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signUpSchema, type SignUpInput } from '@/lib/validations/auth';
import { signUpAction, resendVerificationEmailAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'provider' ? 'provider' : 'customer';
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState<string | null>(null);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: initialRole,
      agreedToTerms: undefined as unknown as true,
    },
  });

  async function onSubmit(values: SignUpInput) {
    setIsSubmitting(true);
    const result = await signUpAction(values);
    setIsSubmitting(false);

    if (!result.success) {
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof SignUpInput, { message });
        }
      } else {
        toast.error(result.message ?? 'Something went wrong. Please try again.');
      }
      return;
    }

    setSubmittedEmail(values.email);
  }

  if (submittedEmail) {
    return (
      <div className="space-y-3 text-center">
        <h1 className="font-display text-2xl font-semibold">Check your inbox</h1>
        <p className="text-muted-foreground">
          We sent a verification link to <span className="font-medium">{submittedEmail}</span>.
          Click it to activate your account.
        </p>
        <div className="flex flex-col items-center gap-2 pt-2">
          <Button
            variant="outline"
            isLoading={isResending}
            onClick={async () => {
              setIsResending(true);
              const result = await resendVerificationEmailAction(submittedEmail);
              setIsResending(false);
              if (!result.success) {
                toast.error(result.message ?? 'Could not resend the email. Try again shortly.');
                return;
              }
              toast.success('Verification email resent');
            }}
          >
            Resend email
          </Button>
          <Button variant="ghost" onClick={() => router.push('/login')}>
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  const selectedRole = form.watch('role');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => form.setValue('role', 'customer')}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors',
              selectedRole === 'customer'
                ? 'border-primary bg-primary-50 text-primary-700'
                : 'border-input hover:bg-secondary'
            )}
          >
            <User className="size-5" />
            I need a service
          </button>
          <button
            type="button"
            onClick={() => form.setValue('role', 'provider')}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors',
              selectedRole === 'provider'
                ? 'border-primary bg-primary-50 text-primary-700'
                : 'border-input hover:bg-secondary'
            )}
          >
            <Briefcase className="size-5" />
            I offer a service
          </button>
        </div>

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="Jordan Rivera" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input type={showPassword ? 'text' : 'password'} autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="agreedToTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="leading-tight">
                <FormLabel className="font-normal">
                  I agree to the{' '}
                  <a href="/legal/terms" className="text-primary hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/legal/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Create account
        </Button>
      </form>
    </Form>
  );
}
