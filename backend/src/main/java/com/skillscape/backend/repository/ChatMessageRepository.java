package com.skillscape.backend.repository;

import com.skillscape.backend.model.ChatMessage;
import com.skillscape.backend.model.ChatType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository
        extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByTypeAndParentIdOrderBySentAtAsc(
        ChatType type, Long parentId);
}