package com.skillscape.backend.model;

public enum GigOrderStatus {
    PENDING,      // just placed by customer
    ACCEPTED,     // freelancer said “I’ll do it”
    REJECTED,     // freelancer can’t or won’t take it
    IN_PROGRESS,  // work is ongoing
    COMPLETED,    // delivered & approved
    CANCELLED     // either party cancelled
}