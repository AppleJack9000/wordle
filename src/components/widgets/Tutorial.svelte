<script lang="ts">
	import { COLS, ROWS } from "../../utils";
	import { Tile } from "../board";
	export let visible: boolean;
</script>

<h3>как играть</h3>
<div>Угадайте <strong>СЛОВО</strong> за {ROWS} попыток.</div>
<div>Каждая попытка должна быть существующим словом из {COLS} букв. Нажмите Enter для отправки.</div>
<div>
	После каждой попытки цвет плиток будет меняться, чтобы показать, насколько близко ваша догадка была к слову.
</div>
<div class:complete={visible} class="examples">
	<div><strong>Примеры</strong></div>
	<div class="row">
		<Tile value="м" state="🟩" />
		<Tile value="а" state="🔳" />
		<Tile value="м" state="🔳" />
		<Tile value="а" state="🔳" />
		<Tile value="н" state="🔳" />
	</div>
	<div>Буква <strong>М</strong> есть в слове и находится в правильном месте.</div>
	<div class="row">
		<Tile value="п" state="🔳" />
		<Tile value="а" state="🟨" />
		<Tile value="п" state="🔳" />
		<Tile value="а" state="🔳" />
		<Tile value="н" state="🔳" />
	</div>
	<div>Буква <strong>А</strong> есть в слове, но в другом месте.</div>
	<div class="row">
		<Tile value="в" state="🔳" />
		<Tile value="о" state="🔳" />
		<Tile value="д" state="🔳" />
		<Tile value="а" state="⬛" />
		<Tile value="н" state="🔳" />
	</div>
	<div>Буквы <strong>А</strong> нет в слове.</div>
</div>
<div>
	Это русская версия оригинального <a
		href="https://www.nytimes.com/games/wordle/"
		target="_blank"
		rel="noreferrer">Wordle</a
	> от Josh Wardle с дополнительными режимами и функциями, позволяющими играть бесконечно. Переключитесь в бесконечный режим, чтобы играть неограниченное количество раз.
	<br /><br />
	Откройте меню настроек, чтобы увидеть дополнительные функции.
	<br />
	Написано на Svelte на TypeScript от
	<a href="https://github.com/MikhaD" target="_blank" rel="noreferrer">MikhaD</a>.
</div>

<style lang="scss">
	div {
		margin: 14px 0;
	}
	.examples {
		border-top: 1px solid var(--border-primary);
		border-bottom: 1px solid var(--border-primary);
		:global(.row > *) {
			height: 100%;
			aspect-ratio: 1;
		}
		&:not(.complete) :global(.row .back) {
			transition-delay: 0.3s;
		}
	}
	.row {
		height: 40px;
		display: flex;
		gap: 4px;
	}
</style>