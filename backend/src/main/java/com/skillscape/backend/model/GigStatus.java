package com.skillscape.backend.model;

public enum GigStatus {
    OPEN,       // accepting applications
    AWARDED,    // one application has been accepted
    IN_PROGRESS,// work is underway
    COMPLETED,  // gig has been delivered
    CANCELLED   // creator or applicant cancelled
}