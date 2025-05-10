package com.skillscape.backend_new.repository;

import com.skillscape.backend_new.model.JobEntity;
import com.skillscape.backend_new.model.UserEntity;
import com.skillscape.backend_new.model.Category;
import com.skillscape.backend_new.model.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<JobEntity, Long> {

    List<JobEntity> findByPostedByUser(UserEntity user);

    List<JobEntity> findByCategory(Category category);

    List<JobEntity> findByStatus(Status status);

    List<JobEntity> findByTitleContainingIgnoreCase(String titleKeyword);

    List<JobEntity> findByCategoryAndStatus(Category category, Status status);

    List<JobEntity> findByPostedByUserAndStatus(UserEntity user, Status status);
}