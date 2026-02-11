<script lang="ts">
  interface Props {
    title: string;
    value: string;
    isMenuMoving?: boolean;
    menuPlacement?: string;
    onclick?: (el: HTMLElement) => void;
  }

  let { title, value, isMenuMoving = false, menuPlacement, onclick }: Props = $props();

  let isDocked = $derived(menuPlacement?.startsWith('hasDocked') ?? false);
  let isDockedTop = $derived(menuPlacement === 'hasDockedTop');
  let isDockedRight = $derived(menuPlacement === 'hasDockedRight');

  function handleClick(e: MouseEvent) {
    if (onclick) {
      e.stopPropagation();
      onclick(e.currentTarget as HTMLElement);
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="flex items-center"
  style="
    margin: 1px; flex-grow: 1;
    {isDockedTop ? 'height: 100%; justify-content: center;' : 'width: 100%; border-bottom: 1px solid #e5e5e5;'}
    {onclick ? 'cursor: pointer;' : ''}
    {isDockedRight ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}
  "
  style:background-color={isMenuMoving ? 'transparent' : undefined}
  onmouseenter={(e) => { if (!isMenuMoving && onclick) (e.currentTarget as HTMLElement).style.backgroundColor = '#f3f3f3'; }}
  onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
  onclick={handleClick}
>
  <div
    class="flex flex-col"
    style="
      {isDockedTop ? 'flex-direction: column-reverse; justify-content: flex-end; padding-top: 50px; margin-left: 20px;' : ''}
      {isDockedRight ? 'margin-right: 30px; margin-left: 0;' : 'margin-left: 30px;'}
    "
  >
    <h1
      class="m-0 w-full select-none"
      style="
        color: rgba(30,30,30,1); letter-spacing: 3px; min-width: 70px;
        {isDocked ? 'font-size: 20px;' : 'font-size: 15px;'}
        {isDockedRight ? 'text-align: right;' : 'text-align: left;'}
      "
    >
      {value}
    </h1>
    <h2
      class="m-0 w-full uppercase select-none"
      style="
        color: rgba(100,100,100,1); font-size: 10px; letter-spacing: 2.3px; margin-top: 5px; margin-bottom: 5px;
        {isDockedRight ? 'text-align: right;' : 'text-align: left;'}
        {isDockedTop ? 'border-bottom: 1px solid rgba(200, 200, 200, 0.5); padding-bottom: 5px;' : ''}
      "
    >
      {title}
    </h2>
  </div>
</div>
