package com.skillscape.backend.specification;

import com.skillscape.backend.model.Gig;
import com.skillscape.backend.model.GigStatus;
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
}