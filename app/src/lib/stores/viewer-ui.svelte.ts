class ViewerUiStore {
  analysisOpen = $state(false);
  gradeGuideVisible = $state(false);
  /** True when the user manually hid the guide for this turn */
  gradeGuideHiddenByUser = $state(false);

  toggleAnalysis() {
    this.analysisOpen = !this.analysisOpen;
  }

  openAnalysis() {
    this.analysisOpen = true;
  }

  closeAnalysis() {
    this.analysisOpen = false;
  }

  showGradeGuide() {
    if (!this.gradeGuideHiddenByUser) {
      this.gradeGuideVisible = true;
    }
  }

  hideGradeGuide() {
    this.gradeGuideVisible = false;
    this.gradeGuideHiddenByUser = true;
  }

  /** Reset the per-turn dismiss flag (call when a new mine starts) */
  resetGradeGuideForTurn() {
    this.gradeGuideHiddenByUser = false;
    this.gradeGuideVisible = false;
  }
}

export const viewerUiStore = new ViewerUiStore();
