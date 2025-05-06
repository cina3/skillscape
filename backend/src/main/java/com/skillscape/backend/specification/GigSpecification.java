package com.skillscape.backend.specification;

import com.skillscape.backend.model.Gig;
import com.skillscape.backend.model.GigStatus;
import com.skillscape.backend.model.GigReview;

import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class GigSpecification {

    public static Specification<Gig> hasTitleLike(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) return null;
            String pattern = "%" + keyword.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("title")), pattern);
        };
    }

    public static Specification<Gig> priceBetween(BigDecimal min, BigDecimal max) {
        return (root, query, cb) -> {
            if (min == null && max == null) return null;
            Path<BigDecimal> price = root.get("price");
            if (min != null && max != null) {
                return cb.between(price, min, max);
            } else if (min != null) {
                return cb.greaterThanOrEqualTo(price, min);
            } else {
                return cb.lessThanOrEqualTo(price, max);
            }
        };
    }

    public static Specification<Gig> hasStatus(GigStatus status) {
        return (root, query, cb) -> {
            if (status == null) return null;
            return cb.equal(root.get("status"), status);
        };
    }

    public static Specification<Gig> hasCategory(Long categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) return null;
            return cb.equal(root.get("category").get("id"), categoryId);
        };
    }

    public static Specification<Gig> minOrderCount(Integer min) {
        return (root, query, cb) -> {
            if (min == null) return null;
            return cb.greaterThanOrEqualTo(cb.size(root.get("orders")), min);
        };
    }

    public static Specification<Gig> maxOrderCount(Integer max) {
        return (root, query, cb) -> {
            if (max == null) return null;
            return cb.lessThanOrEqualTo(cb.size(root.get("orders")), max);
        };
    }

    public static Specification<Gig> minReviewCount(Integer min) {
        return (root, query, cb) -> {
            if (min == null) return null;
            return cb.greaterThanOrEqualTo(cb.size(root.get("reviews")), min);
        };
    }

    public static Specification<Gig> maxReviewCount(Integer max) {
        return (root, query, cb) -> {
            if (max == null) return null;
            return cb.lessThanOrEqualTo(cb.size(root.get("reviews")), max);
        };
    }

    public static Specification<Gig> minFreelancerRating(Double minRating) {
        return (root, query, cb) -> {
            if (minRating == null) return null;
            Subquery<Double> sub = query.subquery(Double.class);
            Root<Gig> subRoot = sub.from(Gig.class);
            Join<Gig,GigReview> revJoin = subRoot.join("reviews", JoinType.LEFT);

            sub.select(cb.avg(revJoin.get("rating")))
               .where(cb.equal(subRoot.get("creator"), root.get("creator")));

            return cb.greaterThanOrEqualTo(sub, minRating);
        };
    }

    public static Specification<Gig> maxFreelancerRating(Double maxRating) {
        return (root, query, cb) -> {
            if (maxRating == null) return null;
            Subquery<Double> sub = query.subquery(Double.class);
            Root<Gig> subRoot = sub.from(Gig.class);
            Join<Gig,GigReview> revJoin = subRoot.join("reviews", JoinType.LEFT);

            sub.select(cb.avg(revJoin.get("rating")))
               .where(cb.equal(subRoot.get("creator"), root.get("creator")));

            return cb.lessThanOrEqualTo(sub, maxRating);
        };
    }

    public static Specification<Gig> minGigRating(Double minRating) {
        return (root, query, cb) -> {
            if (minRating == null) return null;
            Subquery<Double> sub = query.subquery(Double.class);
            Root<GigReview> rev = sub.from(GigReview.class);
            sub.select(cb.avg(rev.get("rating")))
               .where(cb.equal(rev.get("gig"), root));
            return cb.greaterThanOrEqualTo(sub, minRating);
        };
    }

    public static Specification<Gig> maxGigRating(Double maxRating) {
        return (root, query, cb) -> {
            if (maxRating == null) return null;
            Subquery<Double> sub = query.subquery(Double.class);
            Root<GigReview> rev = sub.from(GigReview.class);
            sub.select(cb.avg(rev.get("rating")))
               .where(cb.equal(rev.get("gig"), root));
            return cb.lessThanOrEqualTo(sub, maxRating);
        };
    }

    public static Specification<Gig> isBiddable(Boolean biddable) {
        return (root, query, cb) -> {
            if (biddable == null) return null;
            return cb.equal(root.get("biddable"), biddable);
        };
    }
}