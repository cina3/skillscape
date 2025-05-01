package com.skillscape.backend.specification;

import com.skillscape.backend.model.*;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import java.math.BigDecimal;

public class JobSpecification {
    public static Specification<Job> hasTitleLike(String kw) {
        return (root, query, cb) -> {
            if (kw == null || kw.isBlank()) return null;
            String p = "%" + kw.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("title")), p);
        };
    }

    public static Specification<Job> budgetBetween(BigDecimal min, BigDecimal max) {
        return (root, query, cb) -> {
            if (min == null && max == null) return null;
            Path<BigDecimal> b = root.get("budget");
            if (min != null && max != null) return cb.between(b, min, max);
            if (min != null) return cb.greaterThanOrEqualTo(b, min);
            return cb.lessThanOrEqualTo(b, max);
        };
    }

    public static Specification<Job> hasStatus(JobStatus status) {
        return (root, query, cb) -> status == null ? null
            : cb.equal(root.get("status"), status);
    }

    public static Specification<Job> hasCategory(Long catId) {
        return (root, query, cb) -> catId == null ? null
            : cb.equal(root.get("category").get("id"), catId);
    }

    public static Specification<Job> isBiddable(Boolean biddable) {
        return (root, query, cb) -> biddable == null ? null
            : cb.equal(root.get("biddable"), biddable);
    }

    public static Specification<Job> minProposalCount(Integer min) {
        return (root, query, cb) -> {
            if (min == null) return null;
            return cb.greaterThanOrEqualTo(cb.size(root.get("proposals")), min);
        };
    }
    public static Specification<Job> maxProposalCount(Integer max) {
        return (root, query, cb) -> {
            if (max == null) return null;
            return cb.lessThanOrEqualTo(cb.size(root.get("proposals")), max);
        };
    }

    public static Specification<Job> minReviewCount(Integer min) {
        return (root, query, cb) -> {
            if (min == null) return null;
            return cb.greaterThanOrEqualTo(cb.size(root.get("reviews")), min);
        };
    }
    public static Specification<Job> maxReviewCount(Integer max) {
        return (root, query, cb) -> {
            if (max == null) return null;
            return cb.lessThanOrEqualTo(cb.size(root.get("reviews")), max);
        };
    }

    public static Specification<Job> minFreelancerRating(Double minRating) {
        return (root, query, cb) -> {
            if (minRating == null) return null;
            Subquery<Double> sub = query.subquery(Double.class);
            Root<Job> subRoot = sub.from(Job.class);
            Join<Job, Review> rj = subRoot.join("reviews", JoinType.LEFT);
            sub.select(cb.avg(rj.get("rating")))
               .where(cb.equal(subRoot.get("creator"), root.get("creator")));
            return cb.greaterThanOrEqualTo(sub, minRating);
        };
    }
    public static Specification<Job> maxFreelancerRating(Double maxRating) {
        return (root, query, cb) -> {
            if (maxRating == null) return null;
            Subquery<Double> sub = query.subquery(Double.class);
            Root<Job> subRoot = sub.from(Job.class);
            Join<Job, Review> rj = subRoot.join("reviews", JoinType.LEFT);
            sub.select(cb.avg(rj.get("rating")))
               .where(cb.equal(subRoot.get("creator"), root.get("creator")));
            return cb.lessThanOrEqualTo(sub, maxRating);
        };
    }

    public static Specification<Job> minJobRating(Double minRating) {
        return (root, query, cb) -> {
            if (minRating == null) return null;
            Subquery<Double> sub = query.subquery(Double.class);
            Root<Review> rv = sub.from(Review.class);
            sub.select(cb.avg(rv.get("rating")))
               .where(cb.equal(rv.get("job"), root));
            return cb.greaterThanOrEqualTo(sub, minRating);
        };
    }
    public static Specification<Job> maxJobRating(Double maxRating) {
        return (root, query, cb) -> {
            if (maxRating == null) return null;
            Subquery<Double> sub = query.subquery(Double.class);
            Root<Review> rv = sub.from(Review.class);
            sub.select(cb.avg(rv.get("rating")))
               .where(cb.equal(rv.get("job"), root));
            return cb.lessThanOrEqualTo(sub, maxRating);
        };
    }
}