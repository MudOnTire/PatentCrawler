class Patent {
    constructor(id, name, applyNum, applyDate, applicant, inventors, legalStatus, patentType) {
        this.id = id;
        this.name = name;
        this.applyNum = applyNum;
        this.applyDate = applyDate;
        this.applicant = applicant;
        this.inventors = inventors;
        this.legalStatus = legalStatus;
        this.patentType = patentType;
    }
}

module.exports = Patent;