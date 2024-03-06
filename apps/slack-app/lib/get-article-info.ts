export type GroundingMessage = {
  userIdOrName: string;
  text: string;
};

/**
 * Get an article urlName (i.e. slug) from text
 * @param params - the params
 * @param params.text - the text to generate the article url slug from
 * @returns - the article url name (i.e. slug)
 */
export function getArticleUrlNameFromText({ text }: { text: string }): string {
  if (!text) {
    throw new Error("No text provided to generate article url name from");
  }

  // convert to only alphanumeric characters separated by hyphens
  let articleUrlName = text
    .substring(0, 70) // limit to 70 chars
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens

  articleUrlName += `-${Date.now()}`; // add a random string (unix ts) to the end to ensure uniqueness of article URL

  return articleUrlName;
}

/**
 * Get an article title from text
 * @param params - the params
 * @param params.text - the text to generate the article title from
 * @returns - the article title
 */
export function getArticleTitleFromText({ text }: { text: string }): string {
  if (!text) {
    throw new Error("No text provided to generate article title name from");
  }

  // We'll just take the first 100 chars of the article for the title
  // but you could have more sophisticated logic here or even use AI.
  const articleTitle = text
    .substring(0, 100)
    // a newline in the latter half of the string is a good logical cutoff, if present
    .substring(
      0,
      text.substring(50, 100).indexOf("\n") >= 0
        ? text.substring(50, 100).indexOf("\n") + 50
        : text.length
    )
    .replace(/\s+/g, " ");
  return articleTitle;
}
