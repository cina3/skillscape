package com.skillscape.backend.specification;

import com.skillscape.backend.model.FreelancerProfile;
import org.springframework.data.jpa.domain.Specification;

public class FreelancerProfileSpecification {

    public static Specification<FreelancerProfile> headlineLike(String kw) {
        return (root, query, cb) -> {
            if (kw == null || kw.isBlank()) return null;
            String p = "%" + kw.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("headline")), p);
        };
    }

    public static Specification<FreelancerProfile> nameLike(String kw) {
        return (root, query, cb) -> {
            if (kw == null || kw.isBlank()) return null;
            String p = "%" + kw.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("user").get("displayName")), p);
        };
    }

    public static Specification<FreelancerProfile> minRating(Double min) {
        return (root, query, cb) -> {
            if (min == null) return null;
            return cb.greaterThanOrEqualTo(root.get("averageGigRating"), min);
        };
    }
}