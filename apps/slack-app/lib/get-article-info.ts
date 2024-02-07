
export type GroundingMessage = {
  userIdOrName: string;
  text: string;
};

/**
 * Generate an article urlName (i.e. slug) from text
 * @param params - the params
 * @param params.text - the text to generate the article url slug from
 * @returns - the article url name (i.e. slug)
 */
export function generateArticleUrlNameFromText({
  text
}: {
  text: string;
}): string {
  if (!text) {
    throw new Error("No text provided to generate article url name from");
  }

  // convert to only alphanumeric characters separated by hyphens
  const articleUrlName = text
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "-");
  return articleUrlName;
}
