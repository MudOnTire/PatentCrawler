class PatentTask {
    constructor(id, patentId, patentApplyNumber, patentTitle, isDone) {
        this.id = id;
        this.patentId = patentId;
        this.patentApplyNumber = patentApplyNumber;
        this.patentTitle = patentTitle;
        this.isDone = isDone;
    }
}

module.exports = PatentTask;