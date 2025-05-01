package com.skillscape.backend.model;

import jakarta.persistence.*; 
import lombok.*; 
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set; 

@Entity 
@Table(name = "users")
@Data 
@NoArgsConstructor
@AllArgsConstructor
@Builder 
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String displayName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name="user_roles",
                     joinColumns=@JoinColumn(name="user_id"))
    @Column(name="role")
    @Builder.Default
    private Set<String> roles = new HashSet<>();
}
