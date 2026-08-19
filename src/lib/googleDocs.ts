export async function fetchPublishedGoogleDocHtml(
	publishedUrl: string
) {
	const response = await fetch(publishedUrl);

	if (!response.ok) {
		throw new Error(
			`Could not fetch Google Doc: ${response.status}`
		);
	}

	const html = await response.text();

	return cleanGoogleDocHtml(html);
}

function cleanGoogleDocHtml(rawHtml: string) {
	const bodyMatch = rawHtml.match(
		/<body[^>]*>([\s\S]*?)<\/body>/i
	);

	if (!bodyMatch) {
		return '<p>Google Doc content could not be loaded.</p>';
	}

	let content = bodyMatch[1];

	content = content.replace(
		/^[\s\S]*?(<div id=["']contents["'][^>]*>)/i,
		'$1'
	);

	content = content.replace(
		/<script[\s\S]*?<\/script>/gi,
		''
	);

	content = content
		.replace(/<img\b[^>]*>/gi, '')
		.replace(/<span\b[^>]*>\s*<\/span>/gi, '');

	const googleFooterPattern = new RegExp(
		'<p\\b[^>]*>\\s*<span\\b[^>]*>[\\s\\u00a0]*Page[\\s\\u00a0]*<\\/span>\\s*<span\\b[^>]*>[\\s\\u00a0]*of[\\s\\u00a0]*<\\/span>\\s*<\\/p>',
		'gi'
	);

	content = content.replace(googleFooterPattern, '');

	const emptyParagraphOrHeadingPattern = new RegExp(
		'<(p|h[1-6])\\b[^>]*>\\s*<\\/\\1>',
		'gi'
	);

	const emptyDivPattern = new RegExp(
		'<div\\b[^>]*>\\s*<\\/div>',
		'gi'
	);

	let previousContent = '';

	while (previousContent !== content) {
		previousContent = content;

		content = content
			.replace(emptyParagraphOrHeadingPattern, '')
			.replace(emptyDivPattern, '');
	}

	return content.trim();
}