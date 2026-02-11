<script lang="ts">
  import { page } from '$app/stores';
  import { SignedIn, SignedOut, UserButton } from 'svelte-clerk/client';

  const topItems = [
    { href: '/', label: 'Mine', icon: 'pickaxe' },
    { href: '/explore', label: 'Gallery', icon: 'compass' },
    { href: '/bookmarks', label: 'My Chest', icon: 'chest' },
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
            ? 'bg-yellow-50 text-yellow-600'
            : 'text-black/70 hover:text-black hover:bg-black/5'}"
      >
        {#if item.icon === 'pickaxe'}
          <svg class="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.531 12.469 6.619 20.38a1 1 0 0 1-3-3l7.912-7.912" />
            <path d="M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393" />
            <path d="M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4Z" />
            <path d="M19.686 8.314a12.5 12.5 0 0 1 1.356 10.225 1 1 0 0 1-1.751-.119 22 22 0 0 0-3.393-6.318" />
          </svg>
        {:else if item.icon === 'compass'}
          <svg class="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" />
            <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" stroke="none" opacity="0.3" />
            <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
          </svg>
        {:else if item.icon === 'chest'}
          <svg class="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 13v6a2 2 0 002 2h12a2 2 0 002-2v-6" />
            <path d="M20 13c0-5-3.6-8-8-8s-8 3-8 8" />
            <line x1="4" y1="13" x2="20" y2="13" />
            <rect x="10" y="11" width="4" height="4" rx="1" />
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
            ? 'bg-yellow-50 text-yellow-600'
            : 'text-black/70 hover:text-black hover:bg-black/5'}"
      >
        {#if item.icon === 'book-open'}
          <svg class="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
          </svg>
        {:else if item.icon === 'home'}
          <svg class="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
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
        <svg class="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span class="text-[10px]">Sign in</span>
      </a>
    </SignedOut>
  </div>
</nav>
