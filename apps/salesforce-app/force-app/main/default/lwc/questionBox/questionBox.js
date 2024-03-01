import performKnowledgeSearch from "@salesforce/apex/KnowledgeArticleSearch.performKnowledgeSearch";
import { NavigationMixin } from "lightning/navigation";
import { LightningElement, api, track } from "lwc";

/**
 * Component that displays a question box with suggested Knowledge articles and
 * a button for the user to escalate their request
 */
export default class QuestionBox extends NavigationMixin(LightningElement) {
  @api isDataLoaded = false;
  @api isLoading = false;
  @track searchTerm = "";
  @track searchResults = [];

  handleSearchTermChange(event) {
    this.searchTerm = event.target.value;
  }

  handleSearchInputKeyPress(event) {
    // Execute search when Enter key is pressed
    if (event.keyCode === 13) {
      this.handleSearch();
    }
  }

  handleReadMore(event) {
    // Navigate to the Knowledge Detail Page of the article
    // in a new tab
    const urlName = event.currentTarget.dataset.urlname;
    this[NavigationMixin.GenerateUrl]({
      type: "standard__knowledgeArticlePage",
      attributes: {
        urlName: urlName
      }
    }).then((url) => {
      window.open(url, "_blank");
    });
  }

  handleSearch() {
    this.isDataLoaded = false;
    this.isLoading = true;
    performKnowledgeSearch({ searchTerm: this.searchTerm })
      .then((result) => {
        this.searchResults = result;
        this.isDataLoaded = true;
        this.isLoading = false;
      })
      .catch((error) => {
        console.error("Error in performing knowledge search:", error);
        this.isDataLoaded = true;
        this.isLoading = false;
      });
  }

  handleEscalateCase() {
    // Fire custom event to notify parent to switch views
    const currentUrl = window.location.href;
    const escalationContext = `Page: ${
      currentUrl ? currentUrl : ""
    }\nSuggested Search Results: ${JSON.stringify(
      this.searchResults,
      null,
      2
    )}`;
    const escalateEvent = new CustomEvent("escalate", {
      detail: {
        context: escalationContext,
        initialQuery: this.searchTerm
      }
    });
    this.dispatchEvent(escalateEvent);
  }
}
