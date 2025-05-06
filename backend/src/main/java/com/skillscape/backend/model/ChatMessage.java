package com.skillscape.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name="chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length=20)
    private ChatType type;          

    @Column(nullable = false)
    private Long parentId;          

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="sender_id")
    private User sender;

    @Column(nullable = false, length = 2000)
    private String text;

    @CreationTimestamp
    private LocalDateTime sentAt;
}