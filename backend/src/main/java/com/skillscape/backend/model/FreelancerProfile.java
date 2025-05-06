package com.skillscape.backend.model;

import jakarta.persistence.*;
import lombok.*; 
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "freelancer_profiles")
@Data 
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FreelancerProfile {

    @Id
    @Column(name = "user_id") 
    private Long id;        

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId 
    @JoinColumn(name = "user_id") 
                                  
                              
    private User user;

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