public with sharing class KnowledgeArticleSearch {

    public class ArticleSearchResult {
        @AuraEnabled public String title;
        @AuraEnabled public String id;
        @AuraEnabled public String urlName;
        @AuraEnabled public String snippet;
    }

    @AuraEnabled(Cacheable=true)
    public static Object performKnowledgeSearch(String searchTerm) {
        Search.SearchResults soslSearchResults = Search.find('FIND \'' + searchTerm + '\' IN ALL FIELDS RETURNING Knowledge__kav (Id, Title, UrlName WHERE PublishStatus = \'Online\' AND Language = \'en_US\') WITH SNIPPET (target_length=120)');
        List<Search.SearchResult> knowledgeSearchResults = soslSearchResults.get('Knowledge__kav');

        List<ArticleSearchResult> retValue = new List<ArticleSearchResult>();
        for (Search.SearchResult searchResult : knowledgeSearchResults) { 
            Knowledge__kav article = (Knowledge__kav) searchResult.getSObject(); 

            ArticleSearchResult articleSearchResult = new ArticleSearchResult();
            articleSearchResult.id = article.Id;
            articleSearchResult.title = article.Title;
            articleSearchResult.urlName = article.UrlName;
            articleSearchResult.snippet = searchResult.getSnippet();
            retValue.add(articleSearchResult);
        }
        return retValue;
    }

}