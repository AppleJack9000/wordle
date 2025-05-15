import seedRandom from "seedrandom";
import { GameMode, ms } from "./enums";
import wordList from "./words_5";

export const ROWS = 6;
export const COLS = 5;

export const words = {
	...wordList,
	contains: (word: string) => {
		return wordList.words.includes(word) || wordList.valid.includes(word);
	},
};

// Updated keyboard layout for Russian
export const keys = ["йцукенгшщзхъ", "фывапролджэё", "ячсмитьбю"];

export const PRAISE = [
	"Гений",
	"Великолепно",
	"Впечатляюще",
	"Отлично",
	"Хорошо",
	"Уфф",
];

export const modeData: ModeData = {
	default: GameMode.daily,
	modes: [
		{
			name: "Ежедневный",
			unit: ms.DAY,
			start: 1642370400000,
			seed: newSeed(GameMode.daily),
			historical: false,
			streak: true,
			useTimeZone: true,
		},
		{
			name: "Часовой", 
			unit: ms.HOUR,
			start: 1642528800000,
			seed: newSeed(GameMode.hourly),
			historical: false,
			icon: "m50,7h100v33c0,40 -35,40 -35,60c0,20 35,20 35,60v33h-100v-33c0,-40 35,-40 35,-60c0,-20 -35,-20 -35,-60z",
			streak: true,
		},
		{
			name: "Бесконечный",
			unit: ms.SECOND,
			start: 1642428600000,
			seed: newSeed(GameMode.infinite),
			historical: false,
			icon: "m7,100c0,-50 68,-50 93,0c25,50 93,50 93,0c0,-50 -68,-50 -93,0c-25,50 -93,50 -93,0z",
		},
	]
};

export function newSeed(mode: GameMode, time?: number) {
	const now = time ?? Date.now();
	switch (mode) {
		case GameMode.daily:
			return Date.UTC(1970, 0, 1 + Math.floor((now - (new Date().getTimezoneOffset() * ms.MINUTE)) / ms.DAY));
		case GameMode.hourly:
			return now - (now % ms.HOUR);
		case GameMode.infinite:
			return now - (now % ms.SECOND);
	}
}

export function seededRandomInt(min: number, max: number, seed: number) {
	const rng = seedRandom(`${seed}`);
	return Math.floor(min + (max - min) * rng());
}

export const DELAY_INCREMENT = 200;

abstract class Storable {
	toString() { return JSON.stringify(this); }
}

export class GameState extends Storable {
	public active: boolean;
	public guesses: number;
	public validHard: boolean;
	public time: number;
	public wordNumber: number;
	public board: GameBoard;

	#valid = false;
	#mode: GameMode;

	constructor(mode: GameMode, data?: string) {
		super();
		this.#mode = mode;
		if (data) {
			this.parse(data);
		}
		if (!this.#valid) {
			this.active = true;
			this.guesses = 0;
			this.validHard = true;
			this.time = modeData.modes[mode].seed;
			this.wordNumber = getWordNumber(mode);
			this.board = {
				words: Array(ROWS).fill(""),
				state: Array.from({ length: ROWS }, () => (Array(COLS).fill("🔳"))),
			};

			this.#valid = true;
		}
	}
	get latestWord() {
		return this.board.words[this.guesses];
	}
	get lastState() {
		return this.board.state[this.guesses - 1];
	}
	get lastWord() {
		return this.board.words[this.guesses - 1];
	}
	checkHardMode(): HardModeData {
		for (let i = 0; i < COLS; ++i) {
			if (this.board.state[this.guesses - 1][i] === "🟩" && this.board.words[this.guesses - 1][i] !== this.board.words[this.guesses][i]) {
				return { pos: i, char: this.board.words[this.guesses - 1][i], type: "🟩" };
			}
		}
		for (let i = 0; i < COLS; ++i) {
			if (this.board.state[this.guesses - 1][i] === "🟨" && !this.board.words[this.guesses].includes(this.board.words[this.guesses - 1][i])) {
				return { pos: i, char: this.board.words[this.guesses - 1][i], type: "🟨" };
			}
		}
		return { pos: -1, char: "", type: "⬛" };
	}
	guess(word: string) {
		const characters = word.split("");
		const result = Array<LetterState>(COLS).fill("⬛");
		for (let i = 0; i < COLS; ++i) {
			if (characters[i] === this.latestWord.charAt(i)) {
				result[i] = "🟩";
				characters[i] = "$";
			}
		}
		for (let i = 0; i < COLS; ++i) {
			const pos = characters.indexOf(this.latestWord[i]);
			if (result[i] !== "🟩" && pos >= 0) {
				characters[pos] = "$";
				result[i] = "🟨";
			}
		}
		return result;
	}
	private parse(str: string) {
		const parsed = JSON.parse(str) as GameState;
		if (parsed.wordNumber !== getWordNumber(this.#mode)) return;
		this.active = parsed.active;
		this.guesses = parsed.guesses;
		this.validHard = parsed.validHard;
		this.time = parsed.time;
		this.wordNumber = parsed.wordNumber;
		this.board = parsed.board;

		this.#valid = true;
	}
}

export class Settings extends Storable {
	public hard = new Array(modeData.modes.length).fill(false);
	public dark = true;
	public colorblind = false;
	public tutorial: 0 | 1 | 2 | 3 = 3;

	constructor(settings?: string) {
		super();
		if (settings) {
			const parsed = JSON.parse(settings) as Settings;
			this.hard = parsed.hard;
			this.dark = parsed.dark;
			this.colorblind = parsed.colorblind;
			this.tutorial = parsed.tutorial;
		}
	}
}

export class Stats extends Storable {
	public played = 0;
	public lastGame = 0;
	public guesses = {
		fail: 0,
		1: 0,
		2: 0,
		3: 0,
		4: 0,
		5: 0,
		6: 0,
	};
	public streak: number;
	public maxStreak: number;
	#hasStreak = false;

	constructor(param: string | GameMode) {
		super();
		if (typeof param === "string") {
			this.parse(param);
		} else if (modeData.modes[param].streak) {
			this.streak = 0;
			this.maxStreak = 0;
			this.#hasStreak = true;
		}
	}
	private parse(str: string) {
		const parsed = JSON.parse(str) as Stats;
		this.played = parsed.played;
		this.lastGame = parsed.lastGame;
		this.guesses = parsed.guesses;
		if (parsed.streak != undefined) {
			this.streak = parsed.streak;
			this.maxStreak = parsed.maxStreak;
			this.#hasStreak = true;
		}
	}
	addWin(guesses: number, mode: Mode) {
		++this.guesses[guesses];
		++this.played;
		if (this.#hasStreak) {
			this.streak = mode.seed - this.lastGame > mode.unit ? 1 : this.streak + 1;
			this.maxStreak = Math.max(this.streak, this.maxStreak);
		}
		this.lastGame = mode.seed;
	}
	addLoss(mode: Mode) {
		++this.guesses.fail;
		++this.played;
		if (this.#hasStreak) this.streak = 0;
		this.lastGame = mode.seed;
	}
	get hasStreak() { return this.#hasStreak; }
}

export class LetterStates {
	public й: LetterState = "🔳";
	public ц: LetterState = "🔳";
	public у: LetterState = "🔳";
	public к: LetterState = "🔳";
	public е: LetterState = "🔳";
	public н: LetterState = "🔳";
	public г: LetterState = "🔳";
	public ш: LetterState = "🔳";
	public щ: LetterState = "🔳";
	public з: LetterState = "🔳";
	public х: LetterState = "🔳";
	public ъ: LetterState = "🔳";
	public ф: LetterState = "🔳";
	public ы: LetterState = "🔳";
	public в: LetterState = "🔳";
	public а: LetterState = "🔳";
	public п: LetterState = "🔳";
	public р: LetterState = "🔳";
	public о: LetterState = "🔳";
	public л: LetterState = "🔳";
	public д: LetterState = "🔳";
	public ж: LetterState = "🔳";
	public э: LetterState = "🔳";
	public ё: LetterState = "🔳";
	public я: LetterState = "🔳";
	public ч: LetterState = "🔳";
	public с: LetterState = "🔳";
	public м: LetterState = "🔳";
	public и: LetterState = "🔳";
	public т: LetterState = "🔳";
	public ь: LetterState = "🔳";
	public б: LetterState = "🔳";
	public ю: LetterState = "🔳";

	constructor(board?: GameBoard) {
		if (board) {
			for (let row = 0; row < ROWS; ++row) {
				for (let col = 0; col < board.words[row].length; ++col) {
					if (this[board.words[row][col]] === "🔳" || board.state[row][col] === "🟩") {
						this[board.words[row][col]] = board.state[row][col];
					}
				}
			}
		}
	};
	update(state: LetterState[], word: string) {
		state.forEach((e, i) => {
			const ls = this[word[i]];
			if (ls === "🔳" || e === "🟩") {
				this[word[i]] = e;
			}
		});
	}
}

export function timeRemaining(m: Mode) {
	if (m.useTimeZone) {
		return m.unit - (Date.now() - (m.seed + new Date().getTimezoneOffset() * ms.MINUTE));
	}
	return m.unit - (Date.now() - m.seed);
}

export function failed(s: GameState) {
	return !(s.active || (s.guesses > 0 && s.board.state[s.guesses - 1].join("") === "🟩".repeat(COLS)));
}

export function getWordNumber(mode: GameMode, current?: boolean) {
	const seed = current ? newSeed(mode) : modeData.modes[mode].seed;
	return Math.round((seed - modeData.modes[mode].start) / modeData.modes[mode].unit) + 1;
}