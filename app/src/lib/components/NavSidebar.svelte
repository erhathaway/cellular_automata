<script lang="ts">
  import { page } from '$app/stores';

  let { expanded = false }: { expanded?: boolean } = $props();

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

<nav class="flex h-full flex-col py-2">
  <!-- Top items -->
  <div class="flex flex-col gap-1">
    {#each topItems as item}
      {@const active = isActive($page.url.pathname, item.href)}
      <a
        href={item.href}
        class="flex items-center gap-3 whitespace-nowrap px-3 py-2.5 transition-colors
          {active
            ? 'border-l-[3px] border-[hsl(234,70%,40%)] bg-white/5 text-white'
            : 'border-l-[3px] border-transparent text-neutral-500 hover:text-neutral-300'}"
      >
        <span class="flex h-5 w-5 shrink-0 items-center justify-center">
          {#if item.icon === 'grid'}
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          {:else if item.icon === 'compass'}
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" stroke="none" opacity="0.3" />
              <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
            </svg>
          {:else if item.icon === 'bookmark'}
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          {/if}
        </span>
        <span class="text-sm transition-opacity duration-200 {expanded ? 'opacity-100' : 'opacity-0'}">{item.label}</span>
      </a>
    {/each}
  </div>

  <!-- Spacer -->
  <div class="flex-1"></div>

  <!-- Bottom items -->
  <div class="flex flex-col gap-1">
    {#each bottomItems as item}
      {@const active = isActive($page.url.pathname, item.href)}
      <a
        href={item.href}
        class="flex items-center gap-3 whitespace-nowrap px-3 py-2.5 transition-colors
          {active
            ? 'border-l-[3px] border-[hsl(234,70%,40%)] bg-white/5 text-white'
            : 'border-l-[3px] border-transparent text-neutral-500 hover:text-neutral-300'}"
      >
        <span class="flex h-5 w-5 shrink-0 items-center justify-center">
          {#if item.icon === 'book-open'}
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
              <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
            </svg>
          {:else if item.icon === 'home'}
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
          {/if}
        </span>
        <span class="text-sm transition-opacity duration-200 {expanded ? 'opacity-100' : 'opacity-0'}">{item.label}</span>
      </a>
    {/each}
  </div>
</nav>
