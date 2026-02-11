<script lang="ts">
  import { page } from '$app/stores';
  import { SignedIn, SignedOut, UserButton } from 'svelte-clerk/client';

  const topItems = [
    { href: '/', label: 'Viewer', icon: 'grid' },
    { href: '/explore', label: 'Explore', icon: 'compass' },
    { href: '/bookmarks', label: 'Bookmarks', icon: 'bookmark' },
  ];

  const bottomItems = [
    { href: '/docs', label: 'Learning', icon: 'book-open' },
    { href: '/intro', label: 'Home', icon: 'home' },
  ];

  function isActive(pathname: string, href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }
</script>

<nav class="flex h-full flex-col items-center py-4">
  <!-- Top items -->
  <div class="flex flex-col items-center gap-2">
    {#each topItems as item}
      {@const active = isActive($page.url.pathname, item.href)}
      <a
        href={item.href}
        class="flex w-full flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors
          {active
            ? 'bg-blue-50 text-blue-600'
            : 'text-black/70 hover:text-black hover:bg-black/5'}"
      >
        {#if item.icon === 'grid'}
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        {:else if item.icon === 'compass'}
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" />
            <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" stroke="none" opacity="0.3" />
            <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
          </svg>
        {:else if item.icon === 'bookmark'}
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
        {/if}
        <span class="text-[10px]">{item.label}</span>
      </a>
    {/each}
  </div>

  <!-- Spacer -->
  <div class="flex-1"></div>

  <!-- Bottom items -->
  <div class="flex flex-col items-center gap-2">
    {#each bottomItems as item}
      {@const active = isActive($page.url.pathname, item.href)}
      <a
        href={item.href}
        class="flex w-full flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors
          {active
            ? 'bg-blue-50 text-blue-600'
            : 'text-black/70 hover:text-black hover:bg-black/5'}"
      >
        {#if item.icon === 'book-open'}
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
          </svg>
        {:else if item.icon === 'home'}
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9,22 9,12 15,12 15,22" />
          </svg>
        {/if}
        <span class="text-[10px]">{item.label}</span>
      </a>
    {/each}
  </div>

  <!-- Auth -->
  <div class="mt-2 flex flex-col items-center border-t border-black/10 pt-3">
    <SignedIn>
      <UserButton
        appearance={{ elements: { avatarBox: 'w-8 h-8' } }}
      />
    </SignedIn>
    <SignedOut>
      <a
        href="/sign-in"
        class="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-black/70 transition-colors hover:bg-black/5 hover:text-black"
      >
        <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span class="text-[10px]">Sign in</span>
      </a>
    </SignedOut>
  </div>
</nav>
