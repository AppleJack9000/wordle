<script lang="ts">
	import { createEventDispatcher, getContext, onMount } from "svelte";

	import { mode, settings } from "../../stores";
	import { modeData, GameState } from "../../utils";
	import type { Toaster } from "../widgets";
	import Setting from "./Setting.svelte";

	export let state: GameState;

	const toaster = getContext<Toaster>("toaster");
	const dispatch = createEventDispatcher();

	let root: HTMLElement;
	onMount(() => {
		root = document.documentElement;
	});
	$: {
		if (root) {
			$settings.dark ? root.classList.remove("light") : root.classList.add("light");
			$settings.colorblind
				? root.classList.add("colorblind")
				: root.classList.remove("colorblind");
			localStorage.setItem("settings", $settings.toString());
		}
	}
</script>

<div class="outer">
	<div class="settings-top">
		<h3>настройки</h3>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			on:click={() => {
				if (!state.validHard) {
					toaster.pop("Игра уже нарушила правила сложного режима");
				}
			}}
		>
			<Setting type="switch" bind:value={$settings.hard[$mode]} disabled={!state.validHard}>
				<svelte:fragment slot="title">Сложный режим</svelte:fragment>
				<svelte:fragment slot="desc">
					Все открытые подсказки должны использоваться в последующих догадках
				</svelte:fragment>
			</Setting>
		</div>
		<Setting type="switch" bind:value={$settings.dark}>
			<svelte:fragment slot="title">Тёмная тема</svelte:fragment>
		</Setting>
		<Setting type="switch" bind:value={$settings.colorblind}>
			<svelte:fragment slot="title">Режим для дальтоников</svelte:fragment>
			<svelte:fragment slot="desc">Высококонтрастные цвета</svelte:fragment>
		</Setting>
		<Setting type="dropdown" bind:value={$mode} options={modeData.modes.map((e) => e.name)}>
			<svelte:fragment slot="title">Режим игры</svelte:fragment>
			<svelte:fragment slot="desc">
				Режим игры определяет, как часто обновляется слово
			</svelte:fragment>
		</Setting>
		<Setting type="custom" bind:value={$mode}>
			<svelte:fragment slot="title">Играть в историческую игру</svelte:fragment>
			<svelte:fragment slot="desc">
				Сыграйте в предыдущее слово, вставив ссылку или установив номер даты
			</svelte:fragment>
			<svelte:fragment slot="custom">
				<svg
					class="custom"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					on:click={() => dispatch("historical")}
				>
					<path
						d="M19.391 12c0-4.082-3.309-7.391-7.391-7.391a7.39 7.39 0 0 0-6.523 3.912l1.653 1.567H2v-5.13l1.572 1.659A9.99 9.99 0 0 1 12 2a10 10 0 1 1 0 20c-4.589 0-8.453-3.09-9.631-7.301l2.512-.703c.871 3.113 3.73 5.395 7.119 5.395 4.082 0 7.391-3.309 7.391-7.391zM12 7.5a1 1 0 0 1 1 1v3.062l3.288 3.031a1 1 0 0 1-1.356 1.471L11 12.438V8.5a1 1 0 0 1 1-1z"
					/>
				</svg>
			</svelte:fragment>
		</Setting>
		<div class="links">
			<a href="https://github.com/MikhaD/wordle" target="_blank" rel="noreferrer">
				Поставить ⭐
			</a>
			<a href="https://github.com/MikhaD/wordle/issues" target="_blank" rel="noreferrer">
				Сообщить об ошибке
			</a>
		</div>
	</div>
</div>

<style>
	.outer {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	.links {
		font-size: var(--fs-medium);
		border-bottom: 1px solid var(--border-primary);
		color: var(--fg-secondary);
		display: flex;
		justify-content: space-between;
	}
	:global(.settings-top > div) {
		padding: 16px 0;
		border-bottom: 1px solid var(--border-primary);
	}
	.custom {
		height: 2rem;
		fill: var(--fg-secondary);
		cursor: pointer;
	}
</style>