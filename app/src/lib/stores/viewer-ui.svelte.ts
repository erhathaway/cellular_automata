class ViewerUiStore {
  analysisOpen = $state(false);

  toggleAnalysis() {
    this.analysisOpen = !this.analysisOpen;
  }

  openAnalysis() {
    this.analysisOpen = true;
  }

  closeAnalysis() {
    this.analysisOpen = false;
  }
}

export const viewerUiStore = new ViewerUiStore();
