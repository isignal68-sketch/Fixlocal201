'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { signInWithGoogleAction, signInWithAppleAction } from '@/lib/actions/auth';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.12A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.61H1.26a12 12 0 0 0 0 10.78l4.01-3.12Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.61l4.01 3.12C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.468 2.183-1.238 2.98-.85.87-2.14 1.55-3.25 1.46-.15-1.09.44-2.24 1.19-3.02.83-.87 2.24-1.55 3.3-1.42Zm3.44 15.99c-.53 1.23-.78 1.78-1.46 2.86-.95 1.49-2.29 3.34-3.95 3.36-1.47.02-1.85-.96-3.84-.95-1.99.01-2.41.97-3.88.95-1.66-.02-2.92-1.7-3.87-3.19-2.66-4.13-2.94-8.98-1.3-11.56C2.75 7.05 4.35 6.14 5.86 6.14c1.53 0 2.5.98 3.77.98 1.24 0 2-.98 3.78-.98 1.35 0 2.78.74 3.8 2.02-3.34 1.83-2.8 6.6.58 8.28Z" />
    </svg>
  );
}

export function SocialAuthButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <form action={signInWithGoogleAction}>
        <Button type="submit" variant="outline" className="w-full">
          <GoogleIcon />
          Google
        </Button>
      </form>
      <form action={signInWithAppleAction}>
        <Button type="submit" variant="outline" className="w-full">
          <AppleIcon />
          Apple
        </Button>
      </form>
    </div>
  );
}
