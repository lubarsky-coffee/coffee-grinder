export default {
	Trump: [
		{
			country: 'us',
			language: 'en',
			category: 'top',
			q: 'Trump AND NOT Ukraine',
			// sourcePriority: 500,
		},
	],
	US: [
		{
			country: 'us',
			language: 'en',
			category: 'top',
			q: 'NOT Trump AND NOT Ukraine',
		},
		{
			country: 'us',
			language: 'en',
			category: 'politics',
			q: 'NOT Trump AND NOT Ukraine',
		},
	],
	Ukraine: [
		{
			country: 'us',
			language: 'en',
			q: 'Ukraine',
		},
		{
			country: 'ua',
			language: 'uk,en,ru',
			category: 'top',
		},
	],
	World: [
		{
			country: 'wo',
			language: 'en',
			category: 'world',
			q: 'NOT Trump AND NOT Ukraine',
		},
	],
	// Tech: [
	// 	{
	// 		country: 'us',
	// 		language: 'en',
	// 		categoty: 'technology',
	// 	}
	// ]
}
