package com.skillscape.backend_new.repository;

import com.skillscape.backend_new.model.GigEntity;
import com.skillscape.backend_new.model.UserEntity;
import com.skillscape.backend_new.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GigRepository extends JpaRepository<GigEntity, Long> {

    List<GigEntity> findByUser(UserEntity user);

    List<GigEntity> findByCategory(Category category);

    List<GigEntity> findByTitleContainingIgnoreCase(String titleKeyword);

    List<GigEntity> findByUserAndCategory(UserEntity user, Category category);
}
