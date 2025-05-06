package com.skillscape.backend.model;

import jakarta.persistence.*;
import lombok.*; // Or individual @Getter, @Setter, @ToString, @NoArgsConstructor, @AllArgsConstructor
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "freelancer_profiles")
@Data // Using @Data for now, but be aware of its implications for JPA entities
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FreelancerProfile {

    // =================== CRITICAL SECTION =====================
    @Id // THIS @Id ANNOTATION MUST BE ON THE 'user' FIELD
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    // @MapsId // THIS ANNOTATION MUST BE REMOVED OR COMMENTED OUT. IT SHOULD NOT BE ACTIVE.
    @JoinColumn(name = "user_id") // This column will be the PK of freelancer_profiles
                                  // and the FK to the users table.
    private User user;
    // ================= END CRITICAL SECTION ===================

    // THERE SHOULD BE NO OTHER FIELD IN THIS CLASS ANNOTATED WITH @Id.
    // For example, a line like:
    // @Id
    // private Long id;  // <--- THIS SHOULD NOT EXIST IF YOU HAVE @Id ON 'user'

    @Column(length = 5000)
    private String bio;

    @Column(length = 100)
    private String headline;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PortfolioItem> portfolio = new ArrayList<>();

    @Formula("(select coalesce(avg(r.rating),0) from reviews r where r.gig_id in "
           + "(select g.id from gigs g where g.creator_id = user_id))") // Assumes user_id is the FK column name
    private double averageGigRating;

    @Formula("(select count(*) from gig_orders o where o.gig_id in "
           + "(select g.id from gigs g where g.creator_id = user_id) and o.status='COMPLETED')")
    private int completedGigCount;

    @Formula("(select coalesce(avg(r.rating),0) from job_reviews r where r.job_id in "
           + "(select j.id from jobs j where j.creator_id = user_id))")
    private double averageJobRating;

    @Formula("(select count(*) from job_applications a where a.applicant_id = user_id "
           + "and a.status='COMPLETED')")
    private int completedJobCount;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}